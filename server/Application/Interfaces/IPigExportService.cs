using Application.DTOs.ExportPig;
using Application.Models.PigExport;

namespace Application.Interfaces
{
    public interface IPigExportService
    {
        Task<PigExportRequestModelView> CreatePigExportRequest(CreatePigExportRequestDTO dto);

        Task<PigExportRequestModelView> GetPigExportRequestById(string id);

        Task<List<PigExportRequestModelView>> GetAllPigExportRequests();


        Task<PigExportRequestModelView> ApprovePigExportRequest(string id);

    }
}