using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFeedService
    {
        Task InsertFeedAsync(FeedInsertDTO feed);
        Task UpdateFeedAsync(string feedId, FeedUpdateDTO feedUpdate);
        Task DeleteFeedAsync(string feedId);
        Task<BasePagination<FeedGetModel>> GetFeedAsync(FeedGetDTO feedGetDTO);

    }
}