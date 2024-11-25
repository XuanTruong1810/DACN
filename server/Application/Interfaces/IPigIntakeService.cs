using Application.DTOs;
using Application.Models;
using Application.Models.PigStable;
using Core.Base;
using Core.Entities;

namespace Application.Interfaces
{
    public interface IPigIntakeService
    {
        Task<BasePagination<PigInTakeModelView>> GetAllAsync(int pageIndex, int pageSize, string filter);
        Task<PigInTakeModelView> GetPigIntakeByIdAsync(string id);
        Task<PigInTakeModelView> InsertIntakeAsync(PigIntakeInsertDTO dTO);
        Task<PigDeliveryModel> UpdateIntakeAsync(string id, PigIntakeUpdateDTO model);
        Task<List<GetPigStableModelView>> AllocatePigsToStableAsync(string AreasId, string pigIntakeId);
        Task<PigInTakeModelView> AcceptIntakeAsync(string id, PigIntakeAcceptDTO model);
        Task DeleteAsync(string id);
    }
}