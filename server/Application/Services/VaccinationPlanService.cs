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
            var vaccinationPlans = await _unitOfWork.GetRepository<VaccinationPlan>().GetEntities
                .Where(vp => vp.DeleteTime == null && vp.IsActive)
                .Include(vp => vp.Pigs)
                    .ThenInclude(p => p.Stables)
                .Include(vp => vp.Medicine)
                .Select(vp => new // Select trước khi GroupBy
                {
                    ExaminationDate = vp.LastModifiedTime ?? vp.ScheduledDate,
                    ModifiedDate = vp.LastModifiedTime ?? vp.ScheduledDate,
                    ScheduledDate = vp.ScheduledDate,
                    MedicineId = vp.MedicineId,
                    MedicineName = vp.Medicine.MedicineName,
                    Status = vp.Status,
                    PigId = vp.PigId,
                    StableName = vp.Pigs.Stables.Name
                })
                .ToListAsync();

            // Group sau khi đã lấy data
            var groupedPlans = vaccinationPlans
                .GroupBy(vp => new
                {
                    vp.ExaminationDate.Date, // Group theo ngày
                    vp.MedicineId,
                    vp.MedicineName,
                    vp.Status
                })
                .Select(g => new VaccinationPlanModelView
                {
                    ExaminationDate = g.Key.Date,
                    ModifiedDate = g.First().ModifiedDate,
                    ScheduledDate = g.First().ScheduledDate,
                    VaccinationQuantity = g.Count(),
                    MedicineName = g.Key.MedicineName,
                    VaccineId = g.Key.MedicineId,
                    Status = g.Key.Status,
                    Pigs = g.Select(vp => new PigSchedule
                    {
                        PigId = vp.PigId,
                        StableName = vp.StableName
                    }).ToList()
                })
                .OrderByDescending(vp => vp.ExaminationDate)
                .ToList();

            return groupedPlans;
        }

        public async Task<bool> InsertVaccinationPlanAsync(VaccinationInsertDTO vaccinationInsertDTO)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();

            try
            {
                string examinationId = await GenerateExaminationId();
                string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy user");

                List<PigExaminationDetail> examinationDetails = new();

                foreach (VaccinationInsertDetailDTO detail in vaccinationInsertDTO.VaccinationInsertDetails)
                {
                    if (vaccinationInsertDTO.ExaminationType == "vaccination")
                    {
                        // Lấy lịch tiêm hiện tại
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
                                // Cập nhật thời gian hoãn cho lịch hiện tại
                                vaccinationPlan.LastModifiedTime = detail.LastModifiedTime;

                                // Cập nhật tất cả các lịch tiêm trong tương lai của heo
                                List<VaccinationPlan>? futurePlans = await _unitOfWork.GetRepository<VaccinationPlan>()
                                    .GetEntities
                                    .Where(vp => vp.PigId == detail.PigId
                                           && vp.ScheduledDate > vaccinationPlan.ScheduledDate
                                           && vp.Status == "pending"
                                           && vp.IsActive
                                           && vp.DeleteTime == null)
                                    .ToListAsync();

                                foreach (VaccinationPlan plan in futurePlans)
                                {
                                    // Tính khoảng thời gian giữa lịch hoãn và lịch gốc
                                    TimeSpan delay = detail.LastModifiedTime.DateTime - vaccinationPlan.ScheduledDate;
                                    plan.ScheduledDate = plan.ScheduledDate.Add(delay);
                                    await _unitOfWork.GetRepository<VaccinationPlan>().UpdateAsync(plan);
                                }
                            }
                            else
                            {
                                vaccinationPlan.ActualDate = vaccinationInsertDTO.ExaminationDate.DateTime;
                                vaccinationPlan.Status = "completed";

                                // Kiểm tra và trừ số lượng vaccine trong kho
                                Medicines? vaccine = await _unitOfWork.GetRepository<Medicines>()
                                    .GetEntities
                                    .FirstOrDefaultAsync(m => m.Id == vaccinationInsertDTO.MedicineId);

                                if (vaccine != null)
                                {
                                    if (vaccine.QuantityInStock >= 1)
                                    {
                                        vaccine.QuantityInStock -= 1;
                                        await _unitOfWork.GetRepository<Medicines>().UpdateAsync(vaccine);
                                    }
                                    else
                                    {
                                        throw new Exception($"Số lượng vaccine {vaccine.MedicineName} trong kho không đủ để tiêm. Số lượng còn lại: {vaccine.QuantityInStock}");
                                    }
                                }
                            }
                            await _unitOfWork.GetRepository<VaccinationPlan>().UpdateAsync(vaccinationPlan);
                        }
                    }

                    if (detail.VaccinationInsertMedicationDetails != null)
                    {
                        foreach (VaccinationInsertMedicationDetailDTO med in detail.VaccinationInsertMedicationDetails)
                        {
                            Medicines? medicine = await _unitOfWork.GetRepository<Medicines>()
                                .GetEntities
                                .FirstOrDefaultAsync(m => m.Id == med.MedicineId);

                            if (medicine != null && med.Quantity.HasValue)
                            {
                                if (medicine.QuantityInStock >= med.Quantity.Value)
                                {
                                    medicine.QuantityInStock -= 1;
                                    await _unitOfWork.GetRepository<Medicines>().UpdateAsync(medicine);
                                }
                                else
                                {
                                    throw new Exception($"Số lượng thuốc {medicine.MedicineName} không đủ để thực hiện dùng cho heo, số lượng còn lại là {medicine.QuantityInStock}");
                                }
                            }
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
                    string detailId = await GenerateExaminationDetailId(examinationId, detail.PigId);
                    PigExaminationDetail? examinationDetail = new PigExaminationDetail
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
                                Quantity = med.Quantity.Value,
                            }).ToList()
                    };


                    examinationDetails.Add(examinationDetail);

                }

                PigExamination pigExamination = new()
                {
                    Id = examinationId,
                    ExaminationDate = vaccinationInsertDTO.ExaminationDate.DateTime,
                    MedicineId = vaccinationInsertDTO.MedicineId,
                    ExaminationNote = vaccinationInsertDTO.ExaminationNote,
                    ExaminationType = vaccinationInsertDTO.ExaminationType,
                    CreatedBy = userId,
                    PigExaminationDetails = examinationDetails
                };

                await _unitOfWork.GetRepository<PigExamination>().InsertAsync(pigExamination);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, ex.Message);
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

        private async Task<string> GenerateExaminationDetailId(string examinationId, string pigId)
        {
            return $"EXMD_{examinationId}_{pigId}";
        }

        public async Task<List<PigSchedule>> GetPigScheduleByVaccineIdAsync(string vaccineId, DateTimeOffset date)
        {
            // Lấy ngày đầu và cuối của ngày cần so sánh
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            List<VaccinationPlan>? vaccinationPlans = await _unitOfWork.GetRepository<VaccinationPlan>()
                .GetEntities
                .Where(vp => vp.MedicineId == vaccineId &&
                    (vp.LastModifiedTime.HasValue
                        ? vp.LastModifiedTime.Value >= startDate && vp.LastModifiedTime.Value < endDate
                        : vp.ScheduledDate >= startDate && vp.ScheduledDate < endDate))
                .Include(vp => vp.Pigs)
                    .ThenInclude(p => p.Stables)
                .ToListAsync();

            return vaccinationPlans.Select(vp => new PigSchedule
            {
                PigId = vp.PigId,
                StableName = vp.Pigs.Stables.Name
            }).ToList();
        }
    }
}