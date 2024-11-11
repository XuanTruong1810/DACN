using Application.DTOs.FoodType;
using Application.Models.FoodTypeModelView;
using Core.Entities;

namespace Application.Interfaces
{
    public interface IFoodTypeService
    {
        Task<List<FoodTypeModelView>> GetAllFoodTypes();
        Task<FoodTypeModelView> GetFoodTypeById(string id);
        Task<FoodTypeModelView> CreateFoodType(CreateFoodTypeDto createFoodTypeDto);
        Task<FoodTypeModelView> UpdateFoodType(string id, UpdateFoodTypeDto updateFoodTypeDto);
        Task<FoodTypeModelView> DeleteFoodType(string id);
    }
}