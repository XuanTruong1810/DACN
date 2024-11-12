using Application.DTOs;
using Application.DTOs.Pig;
using Application.Models;
using Application.Models.PigCancelModelView;
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

        Task<PigCancelModelView> CancelPigAsync(string id, PigCancelDTO dto);

        Task<BasePagination<PigCancelModelView>> GetPigCancelAsync(int pageIndex, int pageSize);
    }
}