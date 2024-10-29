using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFeedService
    {
        Task<FeedGetModel> InsertFeedAsync(FeedInsertDTO feed);
        Task<FeedGetModel> UpdateFeedAsync(string feedId, FeedUpdateDTO feedUpdate);
        Task DeleteFeedAsync(string feedId);
        Task<BasePagination<FeedGetModel>> GetFeedAsync(FeedGetDTO feedGetDTO);
        Task<FeedGetModel> GetFeedById(string feedId);

    }
}