using Application.DTOs.Food;
using Application.Interfaces;
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
    public class FoodService : IFoodService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FoodService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<FoodModelView> CreateFood(CreateFoodDto createFoodDto)
        {
            // Bắt đầu transaction
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Validate dữ liệu đầu vào
                if (createFoodDto.FoodSuppliers == null || !createFoodDto.FoodSuppliers.Any())
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Phải có ít nhất một nhà cung cấp!");
                }

                // 2. Kiểm tra trùng lặp supplier
                List<string>? supplierIds = createFoodDto.FoodSuppliers.Select(x => x.SuppliersId).ToList();
                if (supplierIds.Distinct().Count() != supplierIds.Count)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Không được chọn trùng nhà cung cấp!");
                }

                // 3. Kiểm tra FoodType tồn tại
                FoodTypes? foodType = await _unitOfWork.GetRepository<FoodTypes>()
                    .GetByIdAsync(createFoodDto.FoodTypesId)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        "Không tìm thấy loại thức ăn");

                // 4. Kiểm tra tên thức ăn đã tồn tại
                Foods? existingFood = await _unitOfWork.GetRepository<Foods>()
                    .GetEntities
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Name.ToLower() == createFoodDto.Name.ToLower());

                if (existingFood != null)
                {
                    throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict,
                        "Thức ăn đã tồn tại trong hệ thống!");
                }

                // 5. Tạo ID mới
                Foods? lastFood = await _unitOfWork.GetRepository<Foods>()
                    .GetEntities
                    .AsNoTracking()
                    .Where(x => x.Id.StartsWith("F"))
                    .OrderByDescending(x => x.Id)
                    .FirstOrDefaultAsync();

                string newId = lastFood == null ? "F0001" :
                              int.TryParse(lastFood.Id[1..], out int lastNumber) ?
                              $"F{lastNumber + 1:D4}" : "F0001";

                // 6. Tạo và thêm food mới
                Foods? food = _mapper.Map<Foods>(createFoodDto);
                food.Id = newId;
                food.CreatedTime = DateTimeOffset.Now;
                food.Status = "active";

                await _unitOfWork.GetRepository<Foods>().InsertAsync(food);
                await _unitOfWork.SaveAsync();


                _unitOfWork.ClearTracked();

                // 7. Thêm food suppliers
                foreach (CreateFoodSupplierDto supplierDto in createFoodDto.FoodSuppliers)
                {
                    FoodSuppliers? foodSupplier = new FoodSuppliers
                    {
                        FoodsId = newId,
                        SuppliersId = supplierDto.SuppliersId,
                        Status = supplierDto.Status,
                        CreatedTime = DateTimeOffset.Now
                    };
                    await _unitOfWork.GetRepository<FoodSuppliers>().InsertAsync(foodSupplier);
                    _unitOfWork.ClearTracked();
                }
                await _unitOfWork.SaveAsync();

                // 8. Commit transaction
                await transaction.CommitAsync();

                // 9. Trả về kết quả
                return _mapper.Map<FoodModelView>(food);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Lỗi khi tạo thức ăn: " + ex.Message);
            }
        }


        public async Task<FoodModelView> DeleteFood(string id)
        {
            var food = await _unitOfWork.GetRepository<Foods>()
                .GetByIdAsync(id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy thức ăn");

            food.DeleteTime = DateTimeOffset.Now;
            food.Status = "inactive";

            await _unitOfWork.GetRepository<Foods>().UpdateAsync(food);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<FoodModelView>(food);
        }

        public async Task<BasePagination<FoodModelView>> GetAllFoods(string? search, string? supplierId, string? areaId, int? page, int? pageSize)
        {
            try
            {
                // Lấy IQueryable từ repository
                IQueryable<Foods> query = _unitOfWork.GetRepository<Foods>()
                    .GetEntities
                    .Include(x => x.FoodTypes)
                    .Include(x => x.FoodSuppliers)
                        .ThenInclude(x => x.Suppliers)
                    .Where(x => x.DeleteTime == null);

                // Áp dụng các điều kiện tìm kiếm
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(x => x.Name.ToLower().Contains(search.ToLower()));
                }

                if (!string.IsNullOrEmpty(supplierId))
                {
                    query = query.Where(x => x.FoodSuppliers.Any(fs => fs.SuppliersId == supplierId));
                }

                if (!string.IsNullOrEmpty(areaId))
                {
                    query = query.Where(x => x.AreasId == areaId);
                }

                // Tính toán phân trang
                int totalItems = await query.CountAsync();

                // Nếu không có page và pageSize thì lấy tất cả
                if (!page.HasValue && !pageSize.HasValue)
                {
                    List<Foods>? foodAll = await query
                        .OrderByDescending(x => x.CreatedTime)
                        .ToListAsync();

                    List<FoodModelView>? foodAllModelViews = _mapper.Map<List<FoodModelView>>(foodAll);
                    return new BasePagination<FoodModelView>(foodAllModelViews, 10, 1, totalItems);
                }

                int currentPage = page ?? 1;
                int currentPageSize = pageSize ?? 10;
                int totalPages = (int)Math.Ceiling(totalItems / (double)currentPageSize);

                // Validate page number
                if (currentPage < 1)
                {
                    currentPage = 1;
                }
                else if (currentPage > totalPages)
                {
                    currentPage = totalPages;
                }

                // Lấy d�� liệu theo trang
                List<Foods>? foods = await query
                    .OrderByDescending(x => x.CreatedTime)
                    .Skip((currentPage - 1) * currentPageSize)
                    .Take(currentPageSize)
                    .ToListAsync();

                // Map sang ModelView
                List<FoodModelView>? foodModelViews = _mapper.Map<List<FoodModelView>>(foods);

                // Tạo đối tượng phân trang
                return new BasePagination<FoodModelView>(foodModelViews, pageSize ?? 10, page ?? 1, totalItems);


            }
            catch (Exception ex)
            {
                throw new BaseException(
                    StatusCodeHelper.InternalServerError,
                    ErrorCode.InternalServerError,
                    "Lỗi khi lấy danh sách thức ăn: " + ex.Message
                );
            }
        }

        public async Task<FoodModelView> GetFoodById(string id)
        {
            Foods? food = await _unitOfWork.GetRepository<Foods>()
                .GetEntities
                .Include(x => x.FoodTypes)
                .Include(x => x.FoodSuppliers)
                    .ThenInclude(x => x.Suppliers)
                .FirstOrDefaultAsync(x => x.Id == id && x.DeleteTime == null)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy thức ăn");

            return _mapper.Map<FoodModelView>(food);
        }

        public async Task<FoodModelView> UpdateFood(string id, UpdateFoodDto updateFoodDto)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Kiểm tra food có tồn tại không
                Foods? food = await _unitOfWork.GetRepository<Foods>()
                    .GetEntities
                    .Include(x => x.FoodSuppliers)
                    .FirstOrDefaultAsync(x => x.Id == id && x.DeleteTime == null)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        "Không tìm thấy thức ăn");

                // 2. Kiểm tra và cập nhật FoodSuppliers
                if (updateFoodDto.FoodSuppliers != null && updateFoodDto.FoodSuppliers.Any())
                {
                    // 2.1 Lấy danh sách supplier hiện tại
                    List<string>? currentSupplierIds = food.FoodSuppliers.Select(x => x.SuppliersId).ToList();
                    List<string?>? newSupplierIds = updateFoodDto.FoodSuppliers.Select(x => x.SuppliersId).ToList();

                    // 2.2 Xác định suppliers cần thêm mới
                    List<UpdateFoodSupplierDto>? suppliersToAdd = updateFoodDto.FoodSuppliers
                        .Where(x => !currentSupplierIds.Contains(x.SuppliersId))
                        .ToList();

                    // Thêm mới các suppliers
                    foreach (UpdateFoodSupplierDto supplierDto in suppliersToAdd)
                    {
                        FoodSuppliers? foodSupplier = new FoodSuppliers
                        {
                            FoodsId = id,
                            SuppliersId = supplierDto.SuppliersId,

                            Status = supplierDto.Status ?? "active",
                            CreatedTime = DateTimeOffset.Now
                        };

                        await _unitOfWork.GetRepository<FoodSuppliers>().InsertAsync(foodSupplier);
                    }

                    // 2.3 Xác định suppliers cần xóa (chỉ xóa khi số lượng = 0)
                    List<FoodSuppliers>? suppliersToRemove = food.FoodSuppliers
                        .Where(x => !newSupplierIds.Contains(x.SuppliersId))
                        .ToList();



                    // 2.4 Cập nhật thông tin cho suppliers hiện có
                    foreach (var supplierDto in updateFoodDto.FoodSuppliers
                        .Where(x => currentSupplierIds.Contains(x.SuppliersId)))
                    {
                        var existingSupplier = food.FoodSuppliers
                            .First(x => x.SuppliersId == supplierDto.SuppliersId);

                        // Chỉ cập nhật khi có thay đổi
                        if (!string.IsNullOrEmpty(supplierDto.Status))
                            existingSupplier.Status = supplierDto.Status;

                        existingSupplier.LastUpdatedTime = DateTimeOffset.Now;
                    }
                }

                // 3. Cập nhật thông tin cơ bản của food
                if (!string.IsNullOrEmpty(updateFoodDto.Name))
                    food.Name = updateFoodDto.Name;
                if (!string.IsNullOrEmpty(updateFoodDto.Description))
                    food.Description = updateFoodDto.Description;
                if (!string.IsNullOrEmpty(updateFoodDto.FoodTypesId))
                    food.FoodTypesId = updateFoodDto.FoodTypesId;
                if (!string.IsNullOrEmpty(updateFoodDto.AreasId))
                    food.AreasId = updateFoodDto.AreasId;
                if (updateFoodDto.QuantityPerMeal.HasValue)
                    food.QuantityPerMeal = updateFoodDto.QuantityPerMeal;
                if (updateFoodDto.MealsPerDay.HasValue)
                    food.MealsPerDay = updateFoodDto.MealsPerDay;
                if (!string.IsNullOrEmpty(updateFoodDto.Status))
                    food.Status = updateFoodDto.Status;

                food.UpdatedTime = DateTimeOffset.Now;

                // 4. Lưu thay đổi
                await _unitOfWork.GetRepository<Foods>().UpdateAsync(food);
                await _unitOfWork.SaveAsync();

                // 5. Commit transaction
                await transaction.CommitAsync();

                // 6. Trả về kết quả
                return await GetFoodById(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                    "Lỗi khi cập nhật thức ăn: " + ex.Message);
            }
        }
    }
}