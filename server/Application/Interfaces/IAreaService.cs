
using Application.DTOs;
using Application.Models;
using Core.Base;
using Core.Entities;

namespace Application.Interfaces
{
    public interface IAreaService
    {
        Task<BasePagination<AreaModelView>> GetAllAsync(int pageIndex, int pageSize);
        Task<AreaModelView> GetByIdAsync(string id);
        Task CreateAsync(AreaDTO areaModel);
        Task UpdateAsync(string id, AreaDTO areaModel);
        Task DeleteAsync(string id);
    }
}