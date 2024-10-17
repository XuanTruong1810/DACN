using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFeedIntakeService
    {
        Task<BasePagination<FeedRequirementModelView>> GetFeedRequirementsForArea(string areaId, int numberOfDays, int pageIndex, int pageSize);
        Task CreateFeedIntake(List<FeedIntakeInsertDTO> feedIntakeInsertDTOs);
        Task AcceptFeedIntake(string feedInTakeId, FeedIntakeAcceptDTO feedIntakeAcceptDTO);
        Task<FeedDeliveryModel> FeedIntakeDelivery(string feedInTakeId, FeedIntakeDeliveryDTO deliveryDTOs);
        Task UpdateQuantityForFeed(string feedIntakeId);
        Task<BasePagination<FeedIntakeResponseModel>> GetFeedIntake(DateTimeOffset? date, string? supplierId, string? statusManager, string? inStock, string? id, int pageIndex, int pageSize);
        Task CancelFeedIntake(string id);
    }
}