using Application.DTOs.FoodExport;
using Application.Interfaces;
using Application.Models.FoodExportModelView;
using AutoMapper;
using Core.Repositories;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Core.Stores;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Application.Services
{
    public class FoodExportService(IMapper mapper, IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor) : IFoodExportService
    {

        private readonly IMapper _mapper = mapper;
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        private async Task<string> GenerateExportId(DateTimeOffset exportDate)
        {
            string dateString = exportDate.ToString("yyyyMMdd");
            string prefix = $"EXF{dateString}";

            FoodExport? lastExport = await _unitOfWork.GetRepository<FoodExport>()
                .GetEntities
                .Where(x => x.Id.StartsWith(prefix))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastExport != null)
            {
                string lastSequence = lastExport.Id.Substring(prefix.Length);
                sequence = int.Parse(lastSequence) + 1;
            }

            return $"{prefix}{sequence:D3}";
        }

        private async Task<decimal> CalculateRequiredFoodQuantity(string areaId, Foods food)
        {

            List<Stables>? cages = await _unitOfWork.GetRepository<Stables>()
                .GetEntities
                .Where(c => c.AreasId == areaId)
                .Include(c => c.Pigs)
                .ToListAsync();

            int totalPigs = cages.Sum(cage => cage.Pigs.Count);

            decimal requiredQuantity = 0;
            if (food.QuantityPerMeal.HasValue && food.MealsPerDay.HasValue)
            {
                requiredQuantity = (decimal)(food.QuantityPerMeal.Value * food.MealsPerDay.Value * totalPigs);
            }

            return requiredQuantity;
        }

        public async Task<FoodExportModelView> CreateFoodExport(CreateFoodExportDto createFoodExportDto)
        {
            Areas? area = await _unitOfWork.GetRepository<Areas>().GetByIdAsync(createFoodExportDto.AreaId)
          ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không tìm thấy khu vực với ID: {createFoodExportDto.AreaId}");


            FoodExport? existingExport = await _unitOfWork.GetRepository<FoodExport>()
                .GetEntities
                .FirstOrDefaultAsync(x => x.ExportDate.Date == createFoodExportDto.ExportDate.Date
                            && x.AreaName == area.Name);

            if (existingExport != null)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Khu vực này đã được xuất thức ăn trong ngày hôm nay");
            }

            foreach (CreateFoodExportDetailDto detail in createFoodExportDto.Details)
            {
                Foods? food = await _unitOfWork.GetRepository<Foods>()
                    .GetEntities
                    .Include(f => f.Areas)
                    .FirstOrDefaultAsync(x => x.Id == detail.FoodId)
                    ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không tìm thấy thức ăn với ID: {detail.FoodId}");

                if (food.Status != "active")
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Thức ăn {food.Name} hiện không khả dụng");
                }

                if (food.QuantityInStock < detail.Quantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        $"Số lượng xuất của {food.Name} vượt quá số lượng tồn kho. Tồn kho: {food.QuantityInStock}");
                }

                decimal requiredQuantity = await CalculateRequiredFoodQuantity(area.Id, food);

                if (requiredQuantity > 0 && detail.Quantity > requiredQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        $"Số lượng xuất của {food.Name} vượt quá định mức cho phép. " +
                        $"Định mức theo số lượng heo: {requiredQuantity} " +
                        $"(Định mức/heo: {food.QuantityPerMeal} x {food.MealsPerDay} bữa x {await GetTotalPigsInArea(area.Id)} heo)");
                }

                if (food.AreasId != area.Id)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Thức ăn {food.Name} không thuộc khu vực được chọn");
                }
            }

            FoodExport? foodExport = new FoodExport
            {
                Id = await GenerateExportId(createFoodExportDto.ExportDate),
                ExportDate = createFoodExportDto.ExportDate,
                ExportBy = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Note = createFoodExportDto.Note,
                AreaName = area.Name
            };

            foreach (CreateFoodExportDetailDto detail in createFoodExportDto.Details)
            {
                Foods? food = await _unitOfWork.GetRepository<Foods>().GetByIdAsync(detail.FoodId);

                foodExport.FoodExportDetails.Add(new FoodExportDetail
                {
                    FoodId = detail.FoodId,
                    Quantity = detail.Quantity,
                    FoodExportId = foodExport.Id
                });

                food.QuantityInStock -= detail.Quantity;
                await _unitOfWork.GetRepository<Foods>().UpdateAsync(food);
            }

            await _unitOfWork.GetRepository<FoodExport>().InsertAsync(foodExport);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<FoodExportModelView>(foodExport);
        }

        private async Task<int> GetTotalPigsInArea(string areaId)
        {
            List<Stables>? stables = await _unitOfWork.GetRepository<Stables>()
                .GetEntities
                .Where(c => c.AreasId == areaId)
                .Include(c => c.Pigs)
                .ToListAsync();

            return stables.Sum(cage => cage.Pigs.Count);
        }

        public async Task<List<FoodExportModelView>> GetAllFoodExport()
        {
            List<FoodExport>? foodExports = await _unitOfWork.GetRepository<FoodExport>()
                .GetEntities
                .Include(x => x.FoodExportDetails)
                    .ThenInclude(d => d.Food)
                .OrderByDescending(x => x.ExportDate)
                .ToListAsync();

            return foodExports.Select(x => new FoodExportModelView
            {
                Id = x.Id,
                ExportDate = x.ExportDate,
                ExportBy = x.ExportBy,
                ExportByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(u => u.Id == x.ExportBy)?.FullName,
                Note = x.Note,
                AreaName = x.AreaName,
                TotalQuantity = x.FoodExportDetails.Sum(d => d.Quantity),
                Details = x.FoodExportDetails.Select(d => new FoodExportDetailModelView
                {
                    FoodId = d.FoodId,
                    FoodName = d.Food.Name,
                    Quantity = d.Quantity,
                    Unit = "kg"
                }).ToList()
            }).ToList();
        }

        public async Task<FoodExportModelView> GetFoodExportById(string id)
        {
            FoodExport? foodExport = await _unitOfWork.GetRepository<FoodExport>()
                .GetEntities
                .Include(x => x.FoodExportDetails)
                    .ThenInclude(d => d.Food)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (foodExport == null)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không tìm thấy phiếu xuất với ID: {id}");
            }

            return new FoodExportModelView
            {
                Id = foodExport.Id,
                ExportDate = foodExport.ExportDate,
                ExportBy = foodExport.ExportBy,
                Note = foodExport.Note,
                AreaName = foodExport.AreaName,
                ExportByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(u => u.Id == foodExport.ExportBy)?.FullName,
                TotalQuantity = foodExport.FoodExportDetails.Sum(d => d.Quantity),
                Details = foodExport.FoodExportDetails.Select(d => new FoodExportDetailModelView
                {
                    FoodId = d.FoodId,
                    FoodName = d.Food.Name,
                    Quantity = d.Quantity,
                    Unit = "kg"
                }).ToList()
            };
        }
    }
}