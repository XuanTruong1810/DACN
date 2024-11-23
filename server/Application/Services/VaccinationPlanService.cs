using Application.DTOs.Vaccination;
using Application.Interfaces;
using Application.Models.VaccinationPlan;
using Core.Entities;
using Core.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class VaccinationPlanService : IVaccinationPlanService
    {
        private readonly IUnitOfWork _unitOfWork;
        public VaccinationPlanService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<List<VaccinationPlanModelView>> GetVaccinationPlanAsync()
        {
            List<VaccinationPlanModelView>? vaccinationPlans = await _unitOfWork.GetRepository<VaccinationPlan>().GetEntities
                .Where(vp => vp.DeleteTime == null && vp.IsActive)
                .Include(vp => vp.Pigs)
                .Include(vp => vp.Medicine)
                .GroupBy(vp => new { vp.ScheduledDate, vp.MedicineId, vp.LastModifiedTime })
                .Select(g => new VaccinationPlanModelView
                {
                    ExaminationDate = g.Key.LastModifiedTime.HasValue ? g.Key.LastModifiedTime.Value.DateTime : g.Key.ScheduledDate,
                    VaccinationQuantity = g.Count(),
                    MedicineName = g.First().Medicine.MedicineName
                })
                .ToListAsync();
            return vaccinationPlans;
        }

        public async Task<bool> InsertVaccinationPlanAsync(VaccinationInsertDTO vaccinationInsertDTO)
        {
            string id = Guid.NewGuid().ToString();
            string uid = Guid.NewGuid().ToString();
            PigExamination? pigExamination = new PigExamination
            {
                Id = id,
                ExaminationDate = vaccinationInsertDTO.ExaminationDate.DateTime,
                PigExaminationDetails = vaccinationInsertDTO.VaccinationInsertDetails.Select(ped => new PigExaminationDetail
                {
                    Id = uid,
                    PigId = ped.PigId,
                    IsHealthy = ped.IsHealthy,
                    Diagnosis = ped.Diagnosis,
                    HealthNote = ped.HealthNote,
                    TreatmentMethod = ped.TreatmentMethod,
                    PigExaminationId = id,
                    PigExamninationMedicines = ped.VaccinationInsertMedicationDetails.Select(pemed => new PigExamninationMedicine
                    {
                        PigExaminationDetailId = uid,
                        MedicineId = pemed.MedicineId,
                        Quantity = pemed.Quantity,
                    }).ToList()

                }).ToList()
            };
            await _unitOfWork.GetRepository<PigExamination>().InsertAsync(pigExamination);
            await _unitOfWork.SaveAsync();
            return true;
        }
    }
}