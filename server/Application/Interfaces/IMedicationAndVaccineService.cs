using Application.DTOs;
using Application.Models;
using Core.Base;

namespace Application.Interfaces
{
    public interface IMedicationAndVaccineService
    {
        Task<BasePagination<MedVacGetModelView>> GetMedVacAsync(MedVacGetDTO medVacGetDTO);


        Task<MedVacGetModelView> GetMedVacById(string medVacId);

        Task<MedVacGetModelView> InsertMedVacAsync(MedVacDTO medVac);

        Task<MedVacGetModelView> UpdateMedVacAsync(string medVacId, MedVacDTO medVacUpdate);

        Task DeleteMedVacAsync(string medVacId);
    }
}