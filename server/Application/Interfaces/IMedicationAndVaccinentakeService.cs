using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IMedicationAndVaccineIntakeService
    {
        Task CreateMedVacIntake(List<MedVacIntakeDTO> DTO);

        Task AcceptMedVacIntake(string medVacIntakeId, MedVacIntakeAcceptDTO DTO);
        Task<BasePagination<MedVacIntakeResponseModel>> GetMedVacIntake(DateTimeOffset? date, string? supplierId, string? statusManager, string? inStock, string? id, int pageIndex, int pageSize);

        Task<MedVacDeliveryModel> MedVacIntakeDelivery(string medVacIntakeId, MedVacDeliveryDTO DTO);

        Task UpdateQuantityForMedVac(string medVacIntakeId);

        Task CancelMedVacIntake(string medVacIntakeId);

    }
}