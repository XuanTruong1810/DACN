using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IPigService
    {
        Task<BasePagination<PigModelView>> GetAllAsync(PigFilterDTO filter);
        Task<PigModelView> CreateAsync(PigDTO dto);
        Task<PigModelView> GetByIdAsync(string id);
        Task<List<PigModelView>> GetPigsByAreaAsync(string areaId);
        Task<List<PigModelView>> GetPigsByHouseAsync(string houseId);
    }
}