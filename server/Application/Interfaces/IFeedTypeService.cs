using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IFeedTypeService
    {
        Task InsertFeedTypeService(FeedTypeNonQueryDTO dto);

        Task UpdateFeedTypeService(string id, FeedTypeNonQueryDTO dto);

        Task DeleteFeedTypeService(string id);
        Task<BasePagination<FeedTypeGetModel>> GetFeedTypeService(FeedTypeGetDTO feedTypeGetDTO);
    }
}