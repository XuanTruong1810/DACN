using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFeedTypeService
    {
        Task<FeedTypeGetModel> GetFeedById(string id);
        Task<FeedTypeGetModel> InsertFeedTypeService(FeedTypeNonQueryDTO dto);

        Task<FeedTypeGetModel> UpdateFeedTypeService(string id, FeedTypeNonQueryDTO dto);

        Task DeleteFeedTypeService(string id);
        Task<BasePagination<FeedTypeGetModel>> GetFeedTypeService(FeedTypeGetDTO feedTypeGetDTO);
    }
}