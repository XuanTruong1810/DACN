using Application.DTOs.Food;
using Application.Models.FoodModelView;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFoodService
    {
        Task<BasePagination<FoodModelView>> GetAllFoods(string? search, string? supplierId, string? areaId, int? page, int? pageSize);
        Task<FoodModelView> GetFoodById(string id);
        Task<FoodModelView> CreateFood(CreateFoodDto createFoodDto);
        Task<FoodModelView> UpdateFood(string id, UpdateFoodDto updateFoodDto);
        Task<FoodModelView> DeleteFood(string id);
    }
}