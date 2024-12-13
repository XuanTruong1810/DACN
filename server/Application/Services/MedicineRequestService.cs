using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.DTOs;
using Application.DTOs.MedicineImport;
using Application.Interfaces;
using Application.Models;
using Application.Models.Medicine;
using Application.ViewModels.Medicine;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;


namespace server.Application.Services
{
    public class MedicineRequestService : IMedicineRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MedicineRequestService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        private async Task<string> GenerateRequestIdAsync()
        {
            string today = DateTime.UtcNow.ToString("yyyyMMdd");
            string prefix = $"RQM_{today}_";

            var lastRequest = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Where(x => x.ID.StartsWith(prefix))
                .OrderByDescending(x => x.ID)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastRequest != null)
            {
                string lastSequence = lastRequest.ID.Split('_').Last();
                sequence = int.Parse(lastSequence) + 1;
            }

            return $"{prefix}{sequence:D3}";
        }

        public async Task CreateRequest(CreateMedicineRequestDTO dto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Validate input
                if (dto.Details == null || !dto.Details.Any())
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Chi tiết phiếu đề xuất không được trống");

                // Validate medicines exist
                foreach (var detail in dto.Details)
                {
                    var medicine = await _unitOfWork.GetRepository<Medicines>()
                        .GetEntities
                        .Include(m => m.MedicineSuppliers)
                        .FirstOrDefaultAsync(m => m.Id == detail.MedicineId && m.IsActive)
                        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                            $"Thuốc không tồn tại hoặc không còn hoạt động");
                }

                // Check duplicates
                var duplicateMedicine = dto.Details
                    .GroupBy(x => x.MedicineId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .FirstOrDefault();

                if (duplicateMedicine != null)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Không được chọn trùng thuốc trong một phiếu");

                string userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized,
                        "Người dùng chưa đăng nhập");

                string requestId = await GenerateRequestIdAsync();

                RequestMedicine request = new()
                {
                    ID = requestId,
                    RequestBy = userId,
                    RequestDate = DateTimeOffset.UtcNow,
                    Note = dto.Note,
                    Status = RequestStatus.Pending
                };

                await _unitOfWork.GetRepository<RequestMedicine>().InsertAsync(request);

                List<RequestMedicineDetail>? details = dto.Details.Select(d => new RequestMedicineDetail
                {
                    RequestMedicineId = requestId,
                    MedicineId = d.MedicineId,
                    Quantity = d.Quantity,
                    Note = d.Note
                }).ToList();

                await _unitOfWork.GetRepository<RequestMedicineDetail>().AddRangeAsync(details);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();


            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi tạo phiếu đề xuất: " + ex.Message);
            }
        }

        public async Task<RequestMedicineModelView> GetRequestById(string id)
        {
            RequestMedicine? request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(x => x.Details)
                    .ThenInclude(x => x.Medicines)
                .FirstOrDefaultAsync(x => x.ID == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu yêu cầu");

            return new RequestMedicineModelView
            {
                Id = request.ID,
                Status = request.Status.ToString(),
                Note = request.Note,
                CreatedBy = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.RequestBy)?.FullName,
                CreatedById = request.RequestBy,
                CreatedTime = request.RequestDate,
                Details = request.Details.Select(d => new RequestMedicineDetailModelView
                {
                    MedicineId = d.MedicineId,
                    MedicineName = d.Medicines.MedicineName,
                    IsVaccine = d.Medicines.IsVaccine,
                    Unit = d.Medicines.Unit,
                    Quantity = (double)d.Quantity,
                    Note = d.Note,
                    Medicine = new MedicineModelView
                    {
                        Id = d.Medicines.Id,
                        MedicineName = d.Medicines.MedicineName,
                        Unit = d.Medicines.Unit,
                        DaysAfterImport = d.Medicines.DaysAfterImport,
                        IsVaccine = d.Medicines.IsVaccine,
                        Description = d.Medicines.Description,
                        QuantityInStock = d.Medicines.QuantityInStock,
                        Suppliers = d.Medicines.MedicineSuppliers.Select(ms => new SupplierModelView
                        {
                            Id = ms.SupplierId,
                            Name = ms.Suppliers.Name
                        }).ToList()
                    }
                }).ToList()
            };
        }

        public async Task<List<RequestMedicineModelView>> GetRequests()
        {
            List<RequestMedicine>? requests = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(x => x.Details)
                    .ThenInclude(x => x.Medicines)
                .OrderByDescending(x => x.RequestDate)
                .ToListAsync();

            return requests.Select(request => new RequestMedicineModelView
            {
                Id = request.ID,
                Status = request.Status.ToString(),
                Note = request.Note,
                CreatedBy = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.RequestBy)?.FullName,
                CreatedById = request.RequestBy,
                CreatedTime = request.RequestDate,
                Details = request.Details.Select(d => new RequestMedicineDetailModelView
                {
                    MedicineId = d.MedicineId,
                    MedicineName = d.Medicines.MedicineName,
                    IsVaccine = d.Medicines.IsVaccine,
                    Unit = d.Medicines.Unit,
                    Quantity = (double)d.Quantity,
                    Note = d.Note,
                    Status = d.Status.ToString(),
                    Medicine = new MedicineModelView
                    {
                        Id = d.Medicines.Id,
                        MedicineName = d.Medicines.MedicineName,
                        Unit = d.Medicines.Unit,
                        DaysAfterImport = d.Medicines.DaysAfterImport,
                        IsVaccine = d.Medicines.IsVaccine,
                        Description = d.Medicines.Description,
                        QuantityInStock = d.Medicines.QuantityInStock,
                        Suppliers = d.Medicines.MedicineSuppliers.Select(ms => new SupplierModelView
                        {
                            Id = ms.SupplierId,
                            Name = ms.Suppliers.Name
                        }).ToList()
                    }
                }).ToList()
            }).ToList();
        }

        public async Task ApproveRequest(string id, MedicineImportDTO dto)
        {
            RequestMedicine? request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x => x.ID == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu yêu cầu");

            if (request.Status == RequestStatus.Completed)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phiếu yêu cầu đã được chấp nhận");
            }

            if (request.Status == RequestStatus.Rejected)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phiếu yêu cầu đã bị từ chối");
            }

            if (request.Status != RequestStatus.Pending)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Chỉ có thể chấp nhận phiếu đang chờ duyệt");
            }
            if (dto.Rejects != null && dto.Rejects.Any())
            {
                foreach (MedicineRejectDTO reject in dto.Rejects)
                {
                    RequestMedicineDetail? detail = request.Details.FirstOrDefault(x => x.MedicineId == reject.MedicineId)
                        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                            "Không tìm thấy chi tiết thuốc trong phiếu yêu cầu");
                    detail.Status = RequestStatus.Rejected;
                    detail.Note = reject.Reason;
                    await _unitOfWork.GetRepository<RequestMedicineDetail>().UpdateAsync(detail);
                }
            }

            if (dto.Accepts != null && dto.Accepts.Any())
            {
                foreach (MedicineImportAcceptDTO accept in dto.Accepts)
                {
                    List<string>? medicines = accept.Details.Select(x => x.MedicineId).ToList();
                    foreach (string medicineId in medicines)
                    {
                        RequestMedicineDetail? detail = request.Details.FirstOrDefault(x => x.MedicineId == medicineId)
                            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                                "Không tìm thấy chi tiết thuốc trong phiếu yêu cầu");
                        detail.Status = RequestStatus.Completed;
                        detail.Note = "Chấp nhận yêu cầu";
                        await _unitOfWork.GetRepository<RequestMedicineDetail>().UpdateAsync(detail);
                    }
                    string currentDate = DateTime.Now.ToString("yyyyMMdd");
                    string prefix = $"MEDICINE-{currentDate}-";

                    MedicineImport? lastImport = await _unitOfWork.GetRepository<MedicineImport>()
                        .GetEntities
                        .Where(x => x.Id.StartsWith(prefix))
                        .OrderByDescending(x => x.Id)
                        .FirstOrDefaultAsync();

                    int sequence = 1;
                    if (lastImport != null)
                    {
                        string lastSequence = lastImport.Id.Split('-').Last();
                        if (int.TryParse(lastSequence, out int lastNumber))
                        {
                            sequence = lastNumber + 1;
                        }
                    }

                    string medicineImportId = $"{prefix}{sequence:D3}";

                    MedicineImport medicineImport = new()
                    {
                        Id = medicineImportId,
                        ExpectedDeliveryTime = accept.ExpectedDeliveryTime,
                        Deposit = accept.Deposit,
                        SupplierId = accept.SupplierId,
                        Status = ImportStatus.Pending,
                        CreatedBy = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized,
                                "Người dùng chưa đăng nhập"),
                        Receiver = request.RequestBy,
                        MedicineImportDetails = accept.Details.Select(d => new MedicineImportDetail
                        {
                            MedicineId = d.MedicineId,
                            ExpectedQuantity = d.ExpectedQuantity,
                            Price = d.UnitPrice,
                            MedicineImportId = medicineImportId
                        }).ToList()
                    };
                    await _unitOfWork.GetRepository<MedicineImport>().InsertAsync(medicineImport);
                    await _unitOfWork.SaveAsync();
                }
            }
            request.Status = RequestStatus.Completed;
            await _unitOfWork.SaveAsync();
        }

        public async Task RejectRequest(string id, string reason)
        {
            RequestMedicine? request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .FirstOrDefaultAsync(x => x.ID == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu yêu cầu");

            if (request.Status == RequestStatus.Completed)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Không thể từ chối phiếu đã hoàn thành hoặc đang xử lý");
            }

            if (request.Status != RequestStatus.Pending)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Chỉ có thể từ chối phiếu đang chờ duyệt");
            }

            request.Status = RequestStatus.Rejected;
            // request.RejectReason = reason;
            await _unitOfWork.SaveAsync();
        }
    }
}