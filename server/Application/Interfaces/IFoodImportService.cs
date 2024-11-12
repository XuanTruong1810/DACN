

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
        Task<BasePagination<FoodImportModelView>> GetImportsAsync(
            string? search = null,
            string? status = null,
            string? supplierId = null,
            string? requestId = null,
            DateTimeOffset? fromDate = null,
            DateTimeOffset? toDate = null,
            int pageNumber = 1,
            int pageSize = 10
        );

        // Cập nhật trạng thái nhận hàng
        Task<FoodImportModelView> UpdateDeliveryStatusAsync(string id, UpdateDeliveryDto dto);
    }
}