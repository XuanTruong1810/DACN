using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IPigIntakeService
    {
        Task<BasePagination<PigInTakeModelView>> GetAllAsync(int pageIndex, int pageSize, string filter);
        Task<PigInTakeModelView> GetPigIntakeByIdAsync(string id);
        Task InsertIntakeAsync(PigIntakeInsertDTO dTO);
        Task<PigDeliveryModel> UpdateIntakeAsync(string id, PigIntakeUpdateDTO model);
        Task AllocatePigsToStableAsync(string AreasId, string pigIntakeId);
        Task AcceptIntakeAsync(string id, PigIntakeAcceptDTO model);
        Task DeleteAsync(string id);
    }
}