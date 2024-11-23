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
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
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

                Medicines? medicine = new Medicines
                {
                    Id = newId,
                    Unit = dto.Unit,
                    IsVaccine = dto.IsVaccine,
                    MedicineName = dto.MedicineName,
                    Description = dto.Description,
                    Usage = dto.Usage,
                    QuantityInStock = 0,
                    DaysAfterImport = dto.DaysAfterImport,
                    IsActive = dto.IsActive
                };

                await _unitOfWork.GetRepository<Medicines>().InsertAsync(medicine);

                if (dto.MedicineSuppliers != null && dto.MedicineSuppliers.Any())
                {
                    foreach (InsertMedicineSupplierDTO supplierDto in dto.MedicineSuppliers)
                    {
                        MedicineSupplier? medicineSupplier = new MedicineSupplier
                        {
                            MedicineId = medicine.Id,
                            SupplierId = supplierDto.SupplierId
                        };
                        await _unitOfWork.GetRepository<MedicineSupplier>().InsertAsync(medicineSupplier);
                    }
                }
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                return new MedicineModelView
                {
                    Id = medicine.Id,
                    MedicineName = medicine.MedicineName,
                    Unit = medicine.Unit,
                    IsVaccine = medicine.IsVaccine,
                    Description = medicine.Description,
                    Usage = medicine.Usage,
                    QuantityInStock = medicine.QuantityInStock,
                    DaysAfterImport = medicine.DaysAfterImport,
                    IsActive = medicine.IsActive
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, ex.Message);
            }
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

            medicine.MedicineName = dto.MedicineName;
            medicine.Description = dto.Description;
            medicine.UpdatedTime = DateTimeOffset.UtcNow;
            await _unitOfWork.GetRepository<Medicines>().UpdateAsync(medicine);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<MedicineModelView>(medicine);
        }
    }
}