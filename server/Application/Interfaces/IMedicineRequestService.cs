using Application.DTOs;
using Application.DTOs.MedicineImport;
using Application.Models.Medicine;


namespace Application.Interfaces
{
    public interface IMedicineRequestService
    {
        Task CreateRequest(CreateMedicineRequestDTO dto);

        Task<RequestMedicineModelView> GetRequestById(string id);

        Task<List<RequestMedicineModelView>> GetRequests();

        Task ApproveRequest(string id, MedicineImportDTO dto);

        Task RejectRequest(string id, string reason);

    }
}