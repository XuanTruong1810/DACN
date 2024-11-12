using Application.DTOs.FoodImport;
using Application.Interfaces;
using Application.Models.FoodImportModelView;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Security.Claims;

namespace Application.Services
{
    public class FoodImportService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor) : IFoodImportService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public async Task CreateImportsAsync(string requestId, List<CreateFoodImportDto> dtos)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Validate request exists and status
                FoodImportRequests? request = await _unitOfWork.GetRepository<FoodImportRequests>()
                    .GetEntities
                    .Include(x => x.FoodImportRequestDetails)
                    .FirstOrDefaultAsync(x => x.Id == requestId)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        "Không tìm thấy phiếu đề xuất");

                // Cập nhật trạng thái request
                request.Status = "approved";
                await _unitOfWork.GetRepository<FoodImportRequests>().UpdateAsync(request);

                await _unitOfWork.SaveAsync();

                // 2. Validate tổng số lượng nhập
                var quantityValidation = request.FoodImportRequestDetails
                    .GroupBy(d => d.FoodId)
                    .ToDictionary(
                        g => g.Key,
                        g => new
                        {
                            Expected = g.First().ExpectedQuantity,
                            Actual = dtos.SelectMany(dto => dto.Details)
                                .Where(d => d.FoodId == g.Key)
                                .Sum(d => d.ExpectedQuantity)
                        }
                    );

                foreach (var validation in quantityValidation)
                {
                    if (validation.Value.Actual > validation.Value.Expected)
                    {
                        throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                            $"Tổng số lượng nhập vượt quá số lượng đề xuất cho thức ăn {validation.Key}");
                    }
                }

                string userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized,
                        "Người dùng chưa đăng nhập");


                // 3. Tạo phiếu nhập cho từng nhà cung cấp
                foreach (CreateFoodImportDto dto in dtos)
                {
                    _unitOfWork.ClearTracked();
                    // Validate supplier
                    Suppliers? supplier = await _unitOfWork.GetRepository<Suppliers>().GetByIdAsync(dto.SupplierId)
                        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                            $"Không tìm thấy nhà cung cấp {dto.SupplierId}");



                    string importId = await GenerateImportIdAsync();

                    FoodImports? import = new FoodImports
                    {
                        Id = importId,
                        FoodImportRequestId = requestId,
                        SupplierId = dto.SupplierId,
                        CreatedById = userId,
                        Status = "pending",
                        ExpectedDeliveryTime = dto.ExpectedDeliveryTime,
                        DepositAmount = dto.DepositAmount,
                        Note = dto.Note,
                        CreatedTime = DateTimeOffset.UtcNow,
                        FoodImportDetails = dto.Details.Select(d => new FoodImportDetails
                        {
                            FoodId = d.FoodId,
                            UnitPrice = d.UnitPrice,
                            ExpectedQuantity = d.ExpectedQuantity,
                            TotalPrice = d.UnitPrice * d.ExpectedQuantity
                        }).ToList()
                    };

                    await _unitOfWork.GetRepository<FoodImports>().InsertAsync(import);


                    // Save changes sau mỗi lần insert để tránh tracking conflict
                    await _unitOfWork.SaveAsync();
                }

                await transaction.CommitAsync();

            }
            catch (Exception ex)
            {
                if (transaction.GetDbTransaction().Connection != null)
                {
                    await transaction.RollbackAsync();
                }
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi tạo phiếu nhập: " + ex.Message);
            }
        }

        public async Task<FoodImportModelView> UpdateDeliveryStatusAsync(string id, UpdateDeliveryDto dto)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Validate import exists
                var import = await _unitOfWork.GetRepository<FoodImports>()
                    .GetEntities
                    .Include(x => x.FoodImportDetails)
                    .FirstOrDefaultAsync(x => x.Id == id)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        "Không tìm thấy phiếu nhập");

                if (import.Status != "pending")
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Chỉ có thể cập nhật trạng thái cho phiếu nhập đang chờ giao");

                // 2. Validate and update details
                foreach (var detailDto in dto.Details)
                {
                    var detail = import.FoodImportDetails.FirstOrDefault(d => d.FoodId == detailDto.FoodId)
                        ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                            $"Không tìm thấy thức ăn {detailDto.FoodId} trong phiếu nhập");

                    detail.DeliveredQuantity = detailDto.DeliveredQuantity;
                    detail.ActualQuantity = detailDto.ActualQuantity;
                    detail.RejectedQuantity = detailDto.RejectedQuantity;
                    detail.Note = detailDto.Note;
                }

                // 3. Update import status
                import.Status = "delivered";
                import.DeliveredTime = DateTimeOffset.UtcNow;
                import.Note = dto.Note;

                await _unitOfWork.SaveAsync();
                // await _notificationService.NotifyImportDeliveredAsync(id);

                await transaction.CommitAsync();
                return await GetImportByIdAsync(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi cập nhật trạng thái giao hàng: " + ex.Message);
            }
        }

        public async Task<FoodImportModelView> GetImportByIdAsync(string id)
        {
            FoodImports? import = await _unitOfWork.GetRepository<FoodImports>()
                .GetEntities
                .Include(x => x.FoodImportDetails)
                    .ThenInclude(d => d.Food)
                .Include(x => x.Supplier)
                .FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu nhập");

            return _mapper.Map<FoodImportModelView>(import);
        }

        public async Task<BasePagination<FoodImportModelView>> GetImportsAsync(
            string? search = null,
            string? status = null,
            string? supplierId = null,
            string? requestId = null,
            DateTimeOffset? fromDate = null,
            DateTimeOffset? toDate = null,
            int pageNumber = 1,
            int pageSize = 10)
        {
            IQueryable<FoodImports>? query = _unitOfWork.GetRepository<FoodImports>()
                .GetEntities
                .Include(x => x.FoodImportDetails)
                .Include(x => x.Supplier)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
                query = query.Where(x => x.Note.Contains(search) ||
                                       x.Supplier.Name.Contains(search));

            if (!string.IsNullOrEmpty(status))
                query = query.Where(x => x.Status == status);

            if (!string.IsNullOrEmpty(supplierId))
                query = query.Where(x => x.SupplierId == supplierId);

            if (!string.IsNullOrEmpty(requestId))
                query = query.Where(x => x.FoodImportRequestId == requestId);

            if (fromDate.HasValue)
                query = query.Where(x => x.CreatedTime >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(x => x.CreatedTime <= toDate.Value);

            // Get total count
            int totalItems = await query.CountAsync();

            // Apply pagination
            List<FoodImports>? items = await query
                .OrderByDescending(x => x.CreatedTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            List<FoodImportModelView>? modelViews = _mapper.Map<List<FoodImportModelView>>(items);

            return new BasePagination<FoodImportModelView>(modelViews, totalItems, pageNumber, pageSize);
        }

        private async Task<string> GenerateImportIdAsync()
        {
            string today = DateTime.UtcNow.ToString("yyyyMMdd");
            string prefix = $"IPF_{today}_";
            int sequence = 1;

            // Lấy số sequence lớn nhất trong ngày
            var lastImport = await _unitOfWork.GetRepository<FoodImports>()
                .GetEntities
                .Where(x => x.Id.StartsWith(prefix))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            if (lastImport != null)
            {
                string lastSequence = lastImport.Id.Split('_').Last();
                if (int.TryParse(lastSequence, out int lastNumber))
                {
                    sequence = lastNumber + 1;
                }
            }

            // Kiểm tra ID đã tồn tại chưa
            string newId;
            bool exists;
            do
            {
                newId = $"{prefix}{sequence:D3}";
                exists = await _unitOfWork.GetRepository<FoodImports>()
                    .GetEntities
                    .AnyAsync(x => x.Id == newId);
                sequence++;
            } while (exists);

            return newId;
        }
    }
}