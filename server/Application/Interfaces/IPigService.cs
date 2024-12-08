using Application.DTOs;
using Application.DTOs.Pig;
using Application.Models;
using Application.Models.PigCancelModelView;
using Application.Models.PigExport;
using Core.Base;

namespace Application.Interfaces
{
    public interface IPigService
    {
        Task<List<PigInfoModelView>> GetAllAsync(PigFilterDTO filter);
        Task<PigModelView> CreateAsync(PigDTO dto);
        Task<PigModelView> GetByIdAsync(string id);
        Task<List<PigInfoModelView>> GetPigsByAreaAsync(string areaId);
        Task<List<PigInfoModelView>> GetPigsByHouseAsync(string houseId);

        Task<PigCancelModelView> CancelPigAsync(string id, PigCancelDTO dto);

        Task<BasePagination<PigCancelModelView>> GetPigCancelAsync(int pageIndex, int pageSize);


        Task<List<PigExportModelView>> GetPigsForExportAsync();


        Task<List<PigExportModelView>> GetPigsStatusPendingAsync(string status = "pending");


        Task<List<PigVaccinationModelView>> GetPigsVaccinationAsync(string? areaId, string? stableId);


    }
}