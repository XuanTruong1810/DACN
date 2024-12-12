using System.Security.Claims;
using Application.DTOs.FoodImportRequest;
using Application.Interfaces;
using Application.Models.FoodImportRequestModelView;
using Application.Models.FoodModelView;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services
{
    public class FoodImportRequestService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor
          // INotificationService notificationService
          ) : IFoodImportRequestService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        // private readonly INotificationService _notificationService = notificationService;

        private async Task<string> GenerateRequestIdAsync()
        {
            string today = DateTime.UtcNow.ToString("yyyyMMdd");
            string prefix = $"RQF_{today}_";

            // Lấy số phiếu đề xuất trong ngày
            var lastRequest = await _unitOfWork.GetRepository<FoodImportRequests>()
                .GetEntities
                .Where(x => x.Id.StartsWith(prefix))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastRequest != null)
            {
                // Lấy số sequence từ ID cuối cùng
                string lastSequence = lastRequest.Id.Split('_').Last();
                sequence = int.Parse(lastSequence) + 1;
            }

            return $"{prefix}{sequence:D3}"; // Format số sequence thành 3 chữ số
        }

        public async Task<FoodImportRequestModelView> CreateRequestAsync(CreateFoodImportRequestDto dto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Validate input
                if (dto.Details == null || dto.Details.Count == 0)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Chi tiết phiếu đề xuất không được trống");

                // 2. Validate food items exist
                foreach (var detail in dto.Details)
                {
                    var food = await _unitOfWork.GetRepository<Foods>().GetByIdAsync(detail.FoodId)
                        ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không tìm thấy thức ăn với ID: {detail.FoodId}");
                }

                // 3. Check duplicate food items
                var duplicateFood = dto.Details
                    .GroupBy(x => x.FoodId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .FirstOrDefault();
                if (duplicateFood != null)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không được chọn trùng thức ăn trong một phiếu");

                string userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Người dùng chưa đăng nhập");

                // Generate ID theo format
                string requestId = await GenerateRequestIdAsync();

                FoodImportRequests? request = new FoodImportRequests
                {
                    Id = requestId, // Gán ID đã generate
                    CreatedById = userId,
                    CreatedBy = userId,
                    Note = dto.Note,
                    Status = "pending",
                    CreatedTime = DateTimeOffset.UtcNow,
                    FoodImportRequestDetails = dto.Details.Select(d => new FoodImportRequestDetails
                    {
                        FoodId = d.FoodId,
                        FoodImportRequestId = requestId,
                        ExpectedQuantity = d.ExpectedQuantity
                    }).ToList()
                };

                await _unitOfWork.GetRepository<FoodImportRequests>().InsertAsync(request);
                await _unitOfWork.SaveAsync();
                // await _notificationService.NotifyRequestCreatedAsync(request.Id);

                await transaction.CommitAsync();
                return await GetRequestByIdAsync(request.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi tạo phiếu đề xuất: " + ex.Message);
            }
        }

        public async Task<FoodImportRequestModelView> UpdateRequestAsync(string id, UpdateFoodImportRequestDto dto)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {


                // 1. Validate request exists and status
                FoodImportRequests? request = await _unitOfWork.GetRepository<FoodImportRequests>()
                    .GetEntities
                    .Include(x => x.FoodImportRequestDetails)
                    .FirstOrDefaultAsync(x => x.Id == id)
                    ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy phiếu đề xuất");
                if (request.Status != "pending")
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Chỉ có thể cập nhật phiếu đề xuất ở trạng thái chờ duyệt");

                // 2. Validate food items exist
                foreach (UpdateFoodImportRequestDetailDto detail in dto.Details)
                {
                    Foods? food = await _unitOfWork.GetRepository<Foods>().GetByIdAsync(detail.FoodId)
                    ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không tìm thấy thức ăn với ID: {detail.FoodId}");
                }

                // 3. Check duplicate food items
                string? duplicateFood = dto.Details
                    .GroupBy(x => x.FoodId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .FirstOrDefault();
                if (duplicateFood != null)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không được chọn trùng thức ăn trong một phiếu");

                IGenericRepository<FoodImportRequestDetails>? detailRepository = _unitOfWork.GetRepository<FoodImportRequestDetails>();
                List<FoodImportRequestDetails>? currentDetails = request.FoodImportRequestDetails.ToList();

                // 1. Xóa những detail không còn trong danh sách mới
                List<string>? newFoodIds = dto.Details.Select(d => d.FoodId).ToList();
                IEnumerable<FoodImportRequestDetails>? detailsToDelete = currentDetails.Where(d => !newFoodIds.Contains(d.FoodId));
                foreach (FoodImportRequestDetails detail in detailsToDelete)
                {
                    await detailRepository.DeleteAsync(detail);
                }

                // 2. Cập nhật hoặc thêm mới
                foreach (UpdateFoodImportRequestDetailDto newDetail in dto.Details)
                {
                    FoodImportRequestDetails? existingDetail = currentDetails.FirstOrDefault(d => d.FoodId == newDetail.FoodId);
                    if (existingDetail != null)
                    {
                        // Cập nhật detail đã tồn tại
                        existingDetail.ExpectedQuantity = newDetail.ExpectedQuantity;
                        await detailRepository.UpdateAsync(existingDetail);
                    }
                    else
                    {
                        // Thêm detail mới
                        FoodImportRequestDetails? detail = new FoodImportRequestDetails
                        {
                            FoodImportRequestId = id,
                            FoodId = newDetail.FoodId,
                            ExpectedQuantity = newDetail.ExpectedQuantity
                        };
                        await detailRepository.InsertAsync(detail);
                    }
                }

                // 3. Cập nhật thông tin cơ bản của request
                request.Note = dto.Note;
                await _unitOfWork.SaveAsync();

                await transaction.CommitAsync();
                return await GetRequestByIdAsync(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi cập nhật phiếu đề xuất: " + ex.Message);
            }
        }

        public async Task<FoodImportRequestModelView> ApproveRequestAsync(string id, ApproveFoodImportRequestDto dto)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                FoodImportRequests? request = await _unitOfWork.GetRepository<FoodImportRequests>()
                    .GetEntities
                    .Include(x => x.FoodImportRequestDetails)
                    .FirstOrDefaultAsync(x => x.Id == id)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        "Không tìm thấy phiếu đề xuất");

                if (request.Status != "pending")
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Chỉ có thể duyệt phiếu đề xuất ở trạng thái chờ duyệt");

                string userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized,
                        "Người dùng chưa đăng nhập");

                request.Status = dto.Status;
                request.ApprovedTime = DateTimeOffset.UtcNow;

                await _unitOfWork.SaveAsync();

                // if (dto.Status == "approved")
                //     await _notificationService.NotifyRequestApprovedAsync(id);
                // else
                //     await _notificationService.NotifyRequestRejectedAsync(id);

                await transaction.CommitAsync();
                return await GetRequestByIdAsync(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi duyệt phiếu đề xuất: " + ex.Message);
            }
        }

        public async Task<FoodImportRequestModelView> GetRequestByIdAsync(string id)
        {
            FoodImportRequests? request = await _unitOfWork.GetRepository<FoodImportRequests>()
                .GetEntities
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodTypes)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.Areas)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodSuppliers)
                            .ThenInclude(fs => fs.Suppliers)
                .FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Không tìm thấy phiếu đề xuất");
            FoodImportRequestModelView? result = _mapper.Map<FoodImportRequestModelView>(request);
            // result.CreatedById = request.CreatedById;
            result.CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.CreatedById)?.FullName;
            // result.CreatedTime = request.CreatedTime.GetValueOrDefault();
            return result;
        }

        public async Task<List<FoodImportRequestModelView>> GetRequestsAsync(
            string? search = null,
            string? status = null,
            DateTimeOffset? fromDate = null,
            DateTimeOffset? toDate = null)
        {
            IQueryable<FoodImportRequests> query = _unitOfWork.GetRepository<FoodImportRequests>()
                .GetEntities
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodTypes)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.Areas)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodSuppliers)
                            .ThenInclude(fs => fs.Suppliers)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
                query = query.Where(x => x.Note.Contains(search));

            if (!string.IsNullOrEmpty(status))
                query = query.Where(x => x.Status == status);

            if (fromDate.HasValue)
                query = query.Where(x => x.CreatedTime >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(x => x.CreatedTime <= toDate.Value);

            // Execute query and manually map results
            List<FoodImportRequests>? requests = await query.ToListAsync();

            return requests.Select(r => new FoodImportRequestModelView
            {
                Id = r.Id,
                CreatedById = r.CreatedById,
                CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == r.CreatedById)?.FullName,
                CreatedTime = r.CreatedTime.GetValueOrDefault(),

                Note = r.Note,
                Status = r.Status,
                Details = r.FoodImportRequestDetails.Select(d => new FoodImportRequestDetailModelView
                {
                    Id = d.FoodId,
                    FoodId = d.FoodId,
                    ExpectedQuantity = d.ExpectedQuantity,
                    Food = new FoodDetailModelView
                    {
                        Id = d.Foods.Id,
                        Name = d.Foods.Name,
                        Description = d.Foods.Description,
                        FoodTypeName = d.Foods.FoodTypes?.FoodTypeName,
                        AreaName = d.Foods.Areas?.Name,
                        Suppliers = d.Foods.FoodSuppliers.Select(fs => new FoodSupplierModelView
                        {
                            SupplierId = fs.Suppliers.Id,
                            SupplierName = fs.Suppliers.Name
                        }).ToList()
                    }
                }).ToList()
            }).ToList();
        }

        public async Task DeleteRequestAsync(string id)
        {
            // using var transaction = await _unitOfWork.BeginTransactionAsync();
            // try
            // {
            //     var request = await _unitOfWork.GetRepository<FoodImportRequests>()
            //         .GetEntities
            //         .Include(x => x.FoodImportRequestDetails)
            //         .Include(x => x.FoodImports)
            //         .FirstOrDefaultAsync(x => x.Id == id)
            //         ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
            //             "Không tìm thấy phiếu đề xuất");

            //     if (request.Status != "pending")
            //         throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
            //             "Chỉ có thể xóa phiếu đề xuất ở trạng thái chờ duyệt");

            //     if (request.FoodImports.Any())
            //         throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
            //             "Không thể xóa phiếu đề xuất đã có phiếu nhập");

            //     request.DeleteTime = DateTimeOffset.UtcNow;
            //     await _unitOfWork.SaveAsync();

            //     await transaction.CommitAsync();
            // }
            // catch (Exception ex)
            // {
            //     await transaction.RollbackAsync();
            //     throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
            //         "Lỗi khi xóa phiếu đề xuất: " + ex.Message);
            // }
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                "Không thể xóa phiếu đề xuất");
        }
    }
}