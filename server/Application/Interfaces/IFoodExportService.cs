using Application.DTOs.FoodExport;
using Application.Models.FoodExportModelView;

namespace Application.Interfaces
{
    public interface IFoodExportService
    {
        Task<FoodExportModelView> CreateFoodExport(CreateFoodExportDto createFoodExportDto);
        Task<FoodExportModelView> GetFoodExportById(string id);
        Task<List<FoodExportModelView>> GetAllFoodExport();

    }
}