using System.Security.Claims;
using Application.DTOs.Vaccination;
using Application.Interfaces;
using Application.Models.VaccinationPlan;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services
{
    public class VaccinationPlanService : IVaccinationPlanService
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly IHttpContextAccessor _httpContextAccessor;
        public VaccinationPlanService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
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
                    MedicineName = g.First().Medicine.MedicineName,
                    Pigs = g.Select(vp => new PigSchedule
                    {
                        PigId = vp.PigId,
                        StableName = vp.Pigs.Stables.Name
                    }).ToList()
                })
                .ToListAsync();
            return vaccinationPlans;
        }

        public async Task<bool> InsertVaccinationPlanAsync(VaccinationInsertDTO vaccinationInsertDTO)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();

            try
            {
                string examinationId = await GenerateExaminationId();
                string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                PigExamination pigExamination = new()
                {
                    Id = examinationId,
                    ExaminationDate = vaccinationInsertDTO.ExaminationDate.DateTime,
                    MedicineId = vaccinationInsertDTO.MedicineId,
                    ExaminationNote = vaccinationInsertDTO.ExaminationNote,
                    ExaminationType = vaccinationInsertDTO.ExaminationType,
                    CreatedBy = userId,
                    PigExaminationDetails = vaccinationInsertDTO.VaccinationInsertDetails.Select(async detail =>
                    {
                        string detailId = await GenerateExaminationDetailId();

                        if (vaccinationInsertDTO.ExaminationType == "vaccination")
                        {
                            VaccinationPlan? vaccinationPlan = await _unitOfWork.GetRepository<VaccinationPlan>()
                                .GetEntities
                                .Where(vp => vp.PigId == detail.PigId
                                       && vp.MedicineId == vaccinationInsertDTO.MedicineId
                                       && vp.Status == "pending"
                                       && vp.IsActive
                                       && vp.DeleteTime == null)
                                .FirstOrDefaultAsync();

                            if (vaccinationPlan != null)
                            {
                                if (!detail.IsHealthy)
                                {
                                    vaccinationPlan.LastModifiedTime = detail.LastModifiedTime;
                                }
                                else if (detail.IsHealthy)
                                {
                                    vaccinationPlan.ActualDate = vaccinationInsertDTO.ExaminationDate.DateTime;
                                }
                                await _unitOfWork.GetRepository<VaccinationPlan>().UpdateAsync(vaccinationPlan);
                            }
                        }

                        Pigs? pig = await _unitOfWork.GetRepository<Pigs>()
                            .GetEntities
                            .FirstOrDefaultAsync(p => p.Id == detail.PigId);

                        if (pig != null)
                        {
                            pig.HealthStatus = detail.IsHealthy ? "good" : "sick";
                            pig.UpdatedTime = DateTimeOffset.Now;
                            await _unitOfWork.GetRepository<Pigs>().UpdateAsync(pig);
                        }

                        return new PigExaminationDetail
                        {
                            Id = detailId,
                            PigId = detail.PigId,
                            IsHealthy = detail.IsHealthy,
                            Diagnosis = detail.Diagnosis,
                            HealthNote = detail.HealthNote,
                            TreatmentMethod = detail.TreatmentMethod,
                            PigExaminationId = examinationId,
                            PigExaminationMedicines = detail.VaccinationInsertMedicationDetails?.Select(med =>
                                new PigExaminationMedicine
                                {
                                    PigExaminationDetailId = detailId,
                                    MedicineId = med.MedicineId,
                                    Quantity = med.Quantity,
                                }).ToList()
                        };
                    }).Select(t => t.Result).ToList()
                };

                await _unitOfWork.GetRepository<PigExamination>().InsertAsync(pigExamination);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Thêm kế hoạch tiêm chủng thất bại");
            }
        }

        private async Task<string> GenerateExaminationId()
        {
            string today = DateTime.Now.ToString("yyyyMMdd");
            string prefix = $"EXM_{today}_";

            PigExamination? lastExamination = await _unitOfWork.GetRepository<PigExamination>()
                .GetEntities
                .Where(x => x.Id.StartsWith(prefix))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastExamination != null)
            {
                string lastSequence = lastExamination.Id.Split('_').Last();
                if (int.TryParse(lastSequence, out int lastNumber))
                {
                    sequence = lastNumber + 1;
                }
            }

            return $"{prefix}{sequence:D3}";
        }

        private async Task<string> GenerateExaminationDetailId()
        {
            string today = DateTime.Now.ToString("yyyyMMdd");
            string prefix = $"EXMD_{today}_";

            var lastDetail = await _unitOfWork.GetRepository<PigExaminationDetail>()
                .GetEntities
                .Where(x => x.Id.StartsWith(prefix))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastDetail != null)
            {
                string lastSequence = lastDetail.Id.Split('_').Last();
                if (int.TryParse(lastSequence, out int lastNumber))
                {
                    sequence = lastNumber + 1;
                }
            }

            return $"{prefix}{sequence:D3}";
        }
    }
}