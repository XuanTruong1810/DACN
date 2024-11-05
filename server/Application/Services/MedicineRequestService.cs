using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Interfaces;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public MedicineRequestService(
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            IMapper mapper
           )
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        public async Task<string> CreateRequest(CreateMedicineRequestDTO dto)
        {
            string userId = _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Unauthorized");

            // Validate medicine units exist and are active
            foreach (var detail in dto.Details)
            {
                var medicineUnit = await _unitOfWork.GetRepository<MedicineUnit>()
                    .GetEntities
                    .Include(mu => mu.Medicines)
                    .FirstOrDefaultAsync(mu => mu.Id == detail.MedicineUnitId && mu.IsActive)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        $"Đơn vị thuốc không tồn tại hoặc không còn hoạt động");

                if (!medicineUnit.Medicines.IsActive)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        $"Thuốc {medicineUnit.Medicines.MedicineName} không còn hoạt động");
                }
            }

            RequestMedicine? request = new RequestMedicine
            {
                ID = Guid.NewGuid().ToString(),
                RequestBy = userId,
                RequestDate = DateTimeOffset.UtcNow,
                Note = dto.Note,
                Status = RequestStatus.Pending
            };

            await _unitOfWork.GetRepository<RequestMedicine>().InsertAsync(request);

            var details = dto.Details.Select(d => new RequestMedicineDetail
            {
                Id = Guid.NewGuid().ToString(),
                RequestMedicineId = request.ID,
                MedicineUnitId = d.MedicineUnitId,
                Quantity = d.Quantity,
                Note = d.Note
            }).ToList();

            await _unitOfWork.GetRepository<RequestMedicineDetail>().AddRangeAsync(details);
            await _unitOfWork.SaveAsync();

            return request.ID;
        }

        public async Task ApproveRequest(string requestId, string supplierId)
        {
            var request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(r => r.Details)
                .FirstOrDefaultAsync(r => r.ID == requestId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Yêu cầu không tồn tại");

            if (request.Status != RequestStatus.Pending)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Yêu cầu này không trong trạng thái chờ duyệt");
            }

            var supplier = await _unitOfWork.GetRepository<Suppliers>()
                .GetByIdAsync(supplierId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Nhà cung cấp không tồn tại");

            // Validate supplier provides all requested medicines
            foreach (var detail in request.Details)
            {
                var medicineSupplier = await _unitOfWork.GetRepository<MedicineSupplier>()
                    .GetEntities
                    .AnyAsync(ms => ms.MedicineUnitId == detail.MedicineUnitId && ms.SupplierId == supplierId);

                if (!medicineSupplier)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Nhà cung cấp không cung cấp tất cả các loại thuốc yêu cầu");
                }
            }

            // Create import record
            var import = new MedicineImport
            {
                Id = Guid.NewGuid().ToString(),
                RequestMedicineId = requestId,
                SupplierId = supplierId,
                CreatedBy = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                CreatedDate = DateTimeOffset.UtcNow,
                Status = ImportStatus.Pending,
                TotalAmount = 0 // Will be updated when receiving
            };

            await _unitOfWork.GetRepository<MedicineImport>().InsertAsync(import);

            request.Status = RequestStatus.Processing;
            await _unitOfWork.GetRepository<RequestMedicine>().UpdateAsync(request);
            await _unitOfWork.SaveAsync();
        }

        public async Task ReceiveImport(string importId, List<MedicineImportReceiveDetailDTO> details)
        {
            var import = await _unitOfWork.GetRepository<MedicineImport>()
                .GetEntities
                .Include(i => i.RequestMedicine)
                .ThenInclude(r => r.Details)
                .FirstOrDefaultAsync(i => i.Id == importId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Phiếu nhập không tồn tại");

            if (import.Status != ImportStatus.Pending)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phiếu nhập không trong trạng thái chờ nhận");
            }

            decimal totalAmount = 0;

            foreach (var detail in details)
            {
                // Validate quantities
                if (detail.AcceptedQuantity > detail.ReceivedQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Số lượng chấp nhận không thể lớn hơn số lượng nhận");
                }

                var medicineSupplier = await _unitOfWork.GetRepository<MedicineSupplier>()
                    .GetEntities
                    .Include(ms => ms.MedicineUnit)
                    .FirstOrDefaultAsync(ms => ms.Id == detail.MedicineSupplierId)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        "Không tìm thấy thông tin thuốc của nhà cung cấp");

                // Validate against request quantity
                var requestDetail = import.RequestMedicine.Details
                    .FirstOrDefault(d => d.MedicineUnitId == medicineSupplier.MedicineUnitId);

                if (requestDetail == null || detail.ReceivedQuantity > requestDetail.Quantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Số lượng nhận vượt quá số lượng yêu cầu");
                }

                var importDetail = new MedicineImportDetail
                {
                    Id = Guid.NewGuid().ToString(),
                    MedicineImportId = importId,
                    MedicineSupplierId = detail.MedicineSupplierId,
                    ExpectedQuantity = requestDetail.Quantity,
                    ReceivedQuantity = detail.ReceivedQuantity,
                    AcceptedQuantity = detail.AcceptedQuantity,
                    RejectedQuantity = detail.ReceivedQuantity - detail.AcceptedQuantity,
                    Price = detail.Price,
                    Amount = detail.AcceptedQuantity * detail.Price,
                    ManufacturingDate = detail.ManufacturingDate,
                    ExpiryDate = detail.ExpiryDate
                };

                totalAmount += importDetail.Amount;

                // Update medicine unit quantity
                medicineSupplier.MedicineUnit.Quantity += detail.AcceptedQuantity;
                await _unitOfWork.GetRepository<MedicineUnit>().UpdateAsync(medicineSupplier.MedicineUnit);

                await _unitOfWork.GetRepository<MedicineImportDetail>().InsertAsync(importDetail);
            }

            import.Status = ImportStatus.Completed;
            import.TotalAmount = totalAmount;
            await _unitOfWork.GetRepository<MedicineImport>().UpdateAsync(import);

            import.RequestMedicine.Status = RequestStatus.Completed;
            await _unitOfWork.GetRepository<RequestMedicine>().UpdateAsync(import.RequestMedicine);

            await _unitOfWork.SaveAsync();
        }

        public async Task<List<MedicineRequestViewModel>> GetRequests(RequestStatus? status = null)
        {
            IQueryable<RequestMedicine>? query = _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(r => r.Details)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            List<RequestMedicine>? requests = await query
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            List<MedicineRequestViewModel>? requestViewModels = new List<MedicineRequestViewModel>();

            foreach (var request in requests)
            {


                requestViewModels.Add(new MedicineRequestViewModel
                {
                    Id = request.ID,
                    RequestBy = request.RequestBy,
                    RequestByName = "Unknown",
                    RequestDate = request.RequestDate,
                    Note = request.Note,
                    Status = request.Status,
                    StatusDisplay = GetStatusDisplay(request.Status),
                    TotalItems = request.Details.Count
                });
            }

            return requestViewModels;
        }

        public async Task<MedicineRequestDetailViewModel> GetRequestDetail(string requestId)
        {
            var request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(r => r.Details)
                .ThenInclude(d => d.MedicineUnit)
                .ThenInclude(mu => mu.Medicines)
                .Include(r => r.MedicineImports)
                .FirstOrDefaultAsync(r => r.ID == requestId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Yêu cầu không tồn tại");

            // var requestBy = await _userService.GetUserById(request.RequestBy);

            var viewModel = new MedicineRequestDetailViewModel
            {
                Id = request.ID,
                RequestBy = request.RequestBy,
                RequestByName = "Unknown",
                RequestDate = request.RequestDate,
                Note = request.Note,
                Status = request.Status,
                StatusDisplay = GetStatusDisplay(request.Status),
                TotalItems = request.Details.Count,
                Details = request.Details.Select(d => new RequestDetailItemViewModel
                {
                    MedicineUnitId = d.MedicineUnitId,
                    MedicineName = d.MedicineUnit.Medicines.MedicineName,
                    UnitName = d.MedicineUnit.UnitName,
                    Quantity = d.Quantity,
                    Note = d.Note
                }).ToList()
            };

            // Add import information if exists
            var import = request.MedicineImports.FirstOrDefault();
            if (import != null)
            {
                viewModel.Import = await GetImportViewModel(import);
            }

            return viewModel;
        }

        public async Task<List<MedicineImportViewModel>> GetImports(ImportStatus? status = null)
        {
            var query = _unitOfWork.GetRepository<MedicineImport>()
                .GetEntities
                .Include(i => i.Suppliers)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }

            var imports = await query
                .OrderByDescending(i => i.CreatedDate)
                .ToListAsync();

            var importViewModels = new List<MedicineImportViewModel>();

            foreach (var import in imports)
            {
                importViewModels.Add(await GetImportViewModel(import));
            }

            return importViewModels;
        }

        public async Task<MedicineImportDetailViewModel> GetImportDetail(string importId)
        {
            var import = await _unitOfWork.GetRepository<MedicineImport>()
                .GetEntities
                .Include(i => i.Suppliers)
                .Include(i => i.MedicineImportDetails)
                .ThenInclude(d => d.MedicineSupplier)
                .ThenInclude(ms => ms.MedicineUnit)
                .ThenInclude(mu => mu.Medicines)
                .FirstOrDefaultAsync(i => i.Id == importId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Phiếu nhập không tồn tại");

            // var createdBy = await _userService.GetUserById(import.CreatedBy);

            MedicineImportDetailViewModel? viewModel = new MedicineImportDetailViewModel
            {
                Id = import.Id,
                RequestId = import.RequestMedicineId,
                SupplierId = import.SupplierId,
                SupplierName = import.Suppliers.Name,
                CreatedBy = import.CreatedBy,
                CreatedByName = "Unknown",
                CreatedDate = import.CreatedDate,
                Status = import.Status,
                StatusDisplay = GetImportStatusDisplay(import.Status),
                TotalAmount = import.TotalAmount,
                Details = import.MedicineImportDetails.Select(d => new ImportDetailItemViewModel
                {
                    MedicineSupplierId = d.MedicineSupplierId,
                    MedicineName = d.MedicineSupplier.MedicineUnit.Medicines.MedicineName,
                    UnitName = d.MedicineSupplier.MedicineUnit.UnitName,
                    ExpectedQuantity = d.ExpectedQuantity,
                    ReceivedQuantity = d.ReceivedQuantity,
                    AcceptedQuantity = d.AcceptedQuantity,
                    RejectedQuantity = d.RejectedQuantity,
                    Price = d.Price,
                    Amount = d.Amount,
                    ManufacturingDate = d.ManufacturingDate,
                    ExpiryDate = d.ExpiryDate
                }).ToList()
            };

            return viewModel;
        }

        private async Task<MedicineImportViewModel> GetImportViewModel(MedicineImport import)
        {
            // var createdBy = await _userService.GetUserById(import.CreatedBy);

            return new MedicineImportViewModel
            {
                Id = import.Id,
                RequestId = import.RequestMedicineId,
                SupplierId = import.SupplierId,
                SupplierName = import.Suppliers.Name,
                CreatedBy = import.CreatedBy,
                CreatedByName = "Unknown",
                CreatedDate = import.CreatedDate,
                Status = import.Status,
                StatusDisplay = GetImportStatusDisplay(import.Status),
                TotalAmount = import.TotalAmount
            };
        }

        private string GetStatusDisplay(RequestStatus status)
        {
            return status switch
            {
                RequestStatus.Draft => "Nháp",
                RequestStatus.Pending => "Chờ duyệt",
                RequestStatus.Processing => "Đang xử lý",
                RequestStatus.Completed => "Hoàn thành",
                RequestStatus.Rejected => "Từ chối",
                _ => "Không xác định"
            };
        }

        private string GetImportStatusDisplay(ImportStatus status)
        {
            return status switch
            {
                ImportStatus.Pending => "Chờ nhận hàng",
                ImportStatus.Completed => "Đã nhận hàng",
                ImportStatus.Rejected => "Từ chối",
                _ => "Không xác định"
            };
        }
    }
}