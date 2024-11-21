

using Application.DTOs.FoodImport;
using Application.Models.FoodImportModelView;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFoodImportService
    {
        // Quản lý phiếu nhập
        Task CreateImportsAsync(string requestId, List<CreateFoodImportDto> dtos);
        Task<FoodImportModelView> GetImportByIdAsync(string id);
        Task<List<FoodImportModelView>> GetImportsAsync();

        // Cập nhật trạng thái nhận hàng
        Task<FoodImportModelView> UpdateDeliveryStatusAsync(string id, UpdateDeliveryDto dto);


        // Cập nhật trạng thái kho
        Task<FoodImportModelView> UpdateStockStatusAsync(string id);
    }
}