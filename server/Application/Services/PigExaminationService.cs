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
                            MedicineUnit = pm.Medicine.Unit
                        }).ToList()
                    }).ToList()

                }).ToListAsync();
            return pigExaminations;
        }
        // Phương thức này lấy thông tin kiểm tra sức khỏe của một con heo cụ thể dựa trên ID của heo
        public async Task<PigExaminationModelView> GetPigExaminationModelViewsAsync(string pigId)
        {

            PigExamination? pigExamination = await _unitOfWork.GetRepository<PigExamination>()
                .GetEntities
                .Where(pe => pe.DeleteTime == null && pe.ExaminationType == "Regular") // Lọc các bản ghi chưa xóa và kiểm tra định kỳ
                .Include(pe => pe.Medicine) // Load thông tin thuốc chính
                .Include(pe => pe.PigExaminationDetails) // Load chi tiết kiểm tra
                    .ThenInclude(ped => ped.PigExaminationMedicines) // Load danh sách thuốc đã dùng
                        .ThenInclude(pem => pem.Medicine)
                .FirstOrDefaultAsync(pe => pe.PigExaminationDetails.Any(ped => ped.PigId == pigId)); // Tìm bản ghi có chứa thông tin của heo cần tìm

            if (pigExamination == null)
                return null;

            // Lấy thông tin người tạo bản ghi
            ApplicationUser? createdByUser = await _unitOfWork.GetRepository<ApplicationUser>()
                .GetEntities
                .FirstOrDefaultAsync(u => u.Id == pigExamination.CreatedBy);

            return new PigExaminationModelView
            {
                Id = pigExamination.Id,
                ExaminationDate = pigExamination.ExaminationDate,
                MedicineId = pigExamination.MedicineId,
                MedicineName = pigExamination.Medicine?.MedicineName,
                ExaminationType = pigExamination.ExaminationType,
                CreatedTime = pigExamination.CreatedTime.GetValueOrDefault(),
                CreatedBy = pigExamination.CreatedBy,
                CreatedByName = createdByUser?.FullName,
                PigExaminationDetails = pigExamination.PigExaminationDetails
                    .Where(ped => ped.PigId == pigId) // Lọc chi tiết kiểm tra của heo cần tìm
                    .Select(ped => new PigExaminationDetailModelView
                    {
                        PigId = ped.PigId,
                        Diagnosis = ped.Diagnosis,
                        TreatmentMethod = ped.TreatmentMethod,
                        HealthNote = ped.HealthNote,
                        PigExaminationMedicines = ped.PigExaminationMedicines.Select(pem => new PigExaminationMedicineModelView
                        {
                            MedicineId = pem.MedicineId,
                            MedicineName = pem.Medicine?.MedicineName,
                            MedicineQuantity = pem.Quantity,
                            MedicineUnit = pem.Medicine?.Unit
                        }).ToList()
                    }).ToList()
            };
        }
    }
}