using Application.DTOs.Vaccination;
using Application.Models.VaccinationPlan;

namespace Application.Interfaces
{
    public interface IVaccinationPlanService
    {
        Task<List<VaccinationPlanModelView>> GetVaccinationPlanAsync();

        Task<bool> InsertVaccinationPlanAsync(VaccinationInsertDTO vaccinationInsertDTO);


        Task<List<PigSchedule>> GetPigScheduleByVaccineIdAsync(string vaccineId, DateTimeOffset date);
    }
}