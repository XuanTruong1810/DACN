using Application.Interfaces;
using Application.Models.PigExamination;
using Core.Entities;
using Core.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class PigExaminationService : IPigExaminationService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PigExaminationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<PigExaminationModelView>> GetPigExaminationAsync(string examinationType)
        {
            List<PigExaminationModelView>? pigExaminations = await _unitOfWork.GetRepository<PigExamination>()
                .GetEntities
                .Where(pe => pe.DeleteTime == null && pe.ExaminationType == examinationType)
                .Include(pe => pe.Medicine)
                .Select(pe => new PigExaminationModelView
                {
                    Id = pe.Id,
                    ExaminationDate = pe.ExaminationDate,
                    MedicineId = pe.MedicineId,
                    MedicineName = pe.Medicine.MedicineName,
                    ExaminationType = pe.ExaminationType,
                    CreatedTime = pe.CreatedTime.GetValueOrDefault(),
                    CreatedBy = pe.CreatedBy,
                    CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(u => u.Id == pe.CreatedBy).FullName,
                    PigExaminationDetails = pe.PigExaminationDetails.Select(p => new PigExaminationDetailModelView
                    {
                        PigId = p.PigId,
                        Diagnosis = p.Diagnosis,
                        TreatmentMethod = p.TreatmentMethod,
                        HealthNote = p.HealthNote,
                        PigExaminationMedicines = p.PigExaminationMedicines.Select(pm => new PigExaminationMedicineModelView
                        {
                            MedicineId = pm.MedicineId,
                            MedicineName = pm.Medicine.MedicineName,
                            MedicineQuantity = pm.Quantity,
                        }).ToList()
                    }).ToList()

                }).ToListAsync();
            return pigExaminations;
        }
    }
}