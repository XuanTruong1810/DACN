using Application.DTOs.Medicines;
using Application.Interfaces;
using Application.Models.Medicine;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services
{
    public class MedicineService(IUnitOfWork unitOfWork, IMapper mapper) : IMedicineService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;

        public async Task DeleteMedicine(string id)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống");
                }
                Medicines? medicine = await _unitOfWork.GetRepository<Medicines>().GetByIdAsync(id)
                 ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy thuốc");

                medicine.DeleteTime = DateTimeOffset.UtcNow;
                medicine.IsActive = false;

                List<VaccinationPlan>? vaccinationPlans = await _unitOfWork.GetRepository<VaccinationPlan>()
                    .GetEntities
                    .Where(x => x.MedicineId == id)
                    .ToListAsync();

                foreach (VaccinationPlan vaccinationPlan in vaccinationPlans)
                {
                    vaccinationPlan.DeleteTime = DateTimeOffset.UtcNow;
                    vaccinationPlan.IsActive = false;
                    vaccinationPlan.LastModifiedTime = DateTimeOffset.UtcNow;
                    vaccinationPlan.CanVaccinate = false;
                    vaccinationPlan.Status = "cancelled";
                    await _unitOfWork.GetRepository<VaccinationPlan>().UpdateAsync(vaccinationPlan);
                }

                await _unitOfWork.GetRepository<Medicines>().UpdateAsync(medicine);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, ex.Message);
            }
        }

        public async Task<List<MedicineModelView>> GetAllMedicines()
        {
            List<Medicines> medicines = await _unitOfWork.GetRepository<Medicines>().GetEntities
                .Where(x => x.IsActive && x.DeleteTime == null)
                .ToListAsync();
            return _mapper.Map<List<MedicineModelView>>(medicines);
        }

        public async Task<MedicineModelView> GetMedicineById(string id)
        {
            Medicines? medicine = await _unitOfWork.GetRepository<Medicines>().GetByIdAsync(id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy thuốc");
            return _mapper.Map<MedicineModelView>(medicine);
        }

        public async Task<MedicineModelView> InsertMedicine(InsertMedicineDTO dto)
        {
            bool exists = await _unitOfWork.GetRepository<Medicines>().GetEntities
                .AnyAsync(x => x.MedicineName == dto.MedicineName && x.IsActive && x.DeleteTime == null);

            if (exists)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tên thuốc đã tồn tại");
            }

            int nextNumber = await _unitOfWork.GetRepository<Medicines>().GetEntities
                .CountAsync() + 1;

            string newId = $"MED{nextNumber:D4}";

            Medicines? medicine = _mapper.Map<Medicines>(dto);
            medicine.Id = newId;

            await _unitOfWork.GetRepository<Medicines>().InsertAsync(medicine);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<MedicineModelView>(medicine);
        }

        public async Task<MedicineModelView> UpdateMedicine(string id, UpdateMedicineDTO dto)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống");
            }
            Medicines? medicine = await _unitOfWork.GetRepository<Medicines>().GetByIdAsync(id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy thuốc");


            bool exists = await _unitOfWork.GetRepository<Medicines>().GetEntities
                .AnyAsync(x => x.MedicineName == dto.MedicineName
                              && x.Id != id
                              && x.IsActive
                              && x.DeleteTime == null);

            if (exists)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tên thuốc đã tồn tại");
            }

            _mapper.Map(dto, medicine);
            await _unitOfWork.GetRepository<Medicines>().UpdateAsync(medicine);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<MedicineModelView>(medicine);
        }
    }
}