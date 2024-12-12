
using Application.Models.FoodImportRequestModelView;
using Application.DTOs.FoodImportRequest;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFoodImportRequestService
    {
        // Quản lý phiếu đề xuất
        Task<FoodImportRequestModelView> CreateRequestAsync(CreateFoodImportRequestDto dto);
        Task<FoodImportRequestModelView> UpdateRequestAsync(string id, UpdateFoodImportRequestDto dto);
        Task<FoodImportRequestModelView> GetRequestByIdAsync(string id);
        Task<List<FoodImportRequestModelView>> GetRequestsAsync(
            string? search = null,
            string? status = null,
            DateTimeOffset? fromDate = null,
            DateTimeOffset? toDate = null
        );
        Task<FoodImportRequestModelView> ApproveRequestAsync(string id, ApproveFoodImportRequestDto dto);
        Task DeleteRequestAsync(string id); // Xóa phiếu đề xuất
    }
}