using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IStableService
    {
        Task<BasePagination<StableModelView>> GetAllStablesByArea(int pageIndex, int pageSize, string areaId);
        Task<StableModelView> GetStableById(string id);
        Task<StableModelView> InsertStable(StableDTO stable);

        Task<StableModelView> UpdateStable(string id, StableDTO stable);

        Task DeleteStable(string id);
    }
}