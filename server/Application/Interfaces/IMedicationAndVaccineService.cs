using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IMedicationAndVaccineService
    {
        Task<BasePagination<MedVacGetModelView>> GetMedVacAsync(MedVacGetDTO medVacGetDTO);

        Task InsertMedVacAsync(MedVacDTO medVac);

        Task UpdateMedVacAsync(string medVacId, MedVacDTO medVacUpdate);

        Task DeleteMedVacAsync(string medVacId);
    }
}