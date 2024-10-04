using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IStableService
    {
        Task<BasePagination<StableModelView>> GetAllStablesByArea(int pageIndex, int pageSize, string areaId);

        Task InsertStable(StableDTO stable);

        Task UpdateStable(string id, StableDTO stable);

        Task DeleteStable(string id);
    }
}