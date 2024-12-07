using Application.DTOs.Medicines;
using Application.Interfaces;
using Application.Models;
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

        public async Task<List<MedicineModelView>> GetAllMedicines(bool? isVaccine)
        {
            List<MedicineModelView>? medicines = await _unitOfWork.GetRepository<Medicines>().GetEntities
                .Where(x => x.IsActive && x.DeleteTime == null && (!isVaccine.HasValue || x.IsVaccine == isVaccine))
                .Select(m => new MedicineModelView
                {
                    Id = m.Id,
                    MedicineName = m.MedicineName,
                    Description = m.Description,
                    Usage = m.Usage,
                    Unit = m.Unit,
                    QuantityInStock = m.QuantityInStock,
                    IsVaccine = m.IsVaccine,
                    DaysAfterImport = m.DaysAfterImport,
                    IsActive = m.IsActive,
                    QuantityRequired = _unitOfWork.GetRepository<VaccinationPlan>()
                        .GetEntities
                        .Where(p => p.MedicineId == m.Id && p.IsActive
                        && p.DeleteTime == null && p.Status == "pending")
                        .Count(),
                    Suppliers = m.MedicineSuppliers.Select(ms => new SupplierModelView
                    {
                        Id = ms.Suppliers.Id,
                        Name = ms.Suppliers.Name,
                        Email = ms.Suppliers.Email,
                        Phone = ms.Suppliers.Phone,
                        Address = ms.Suppliers.Address
                    }).ToList()
                })
                .ToListAsync();

            return medicines;
        }


        public async Task<MedicineModelView> GetMedicineById(string id)
        {
            Medicines? medicine = await _unitOfWork.GetRepository<Medicines>().GetByIdAsync(id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy thuốc");
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
                IsActive = medicine.IsActive,
                QuantityRequired = _unitOfWork.GetRepository<VaccinationPlan>()
                       .GetEntities
                       .Where(p => p.MedicineId == medicine.Id && p.IsActive
                       && p.DeleteTime == null && p.Status == "pending")
                       .Count(),
                Suppliers = medicine.MedicineSuppliers.Select(ms => new SupplierModelView
                {
                    Id = ms.Suppliers.Id,
                    Name = ms.Suppliers.Name,
                    Email = ms.Suppliers.Email,
                    Phone = ms.Suppliers.Phone,
                    Address = ms.Suppliers.Address
                }).ToList(),
            };
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
                    IsActive = medicine.IsActive,
                    QuantityRequired = _unitOfWork.GetRepository<VaccinationPlan>()
                        .GetEntities
                        .Where(p => p.MedicineId == medicine.Id && p.IsActive
                        && p.DeleteTime == null && p.Status == "pending")
                        .Count(),
                    Suppliers = medicine.MedicineSuppliers.Select(ms => new SupplierModelView
                    {
                        Id = ms.Suppliers.Id,
                        Name = ms.Suppliers.Name,
                        Email = ms.Suppliers.Email,
                        Phone = ms.Suppliers.Phone,
                        Address = ms.Suppliers.Address
                    }).ToList(),
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

            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
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
                medicine.IsVaccine = dto.IsVaccine.GetValueOrDefault();
                medicine.Usage = dto.Usage;
                medicine.DaysAfterImport = dto.DaysAfterImport;
                medicine.IsActive = dto.IsActive.GetValueOrDefault();
                medicine.UpdatedTime = DateTimeOffset.UtcNow;

                await _unitOfWork.GetRepository<Medicines>().UpdateAsync(medicine);
                await _unitOfWork.SaveAsync();

                if (dto.MedicineSuppliers != null && dto.MedicineSuppliers.Any())
                {
                    // Remove existing suppliers
                    List<MedicineSupplier>? existingSuppliers = await _unitOfWork.GetRepository<MedicineSupplier>()
                        .GetEntities
                        .Where(ms => ms.MedicineId == id)
                        .ToListAsync();

                    await _unitOfWork.GetRepository<MedicineSupplier>().DeleteRangeAsync(existingSuppliers);
                    await _unitOfWork.SaveAsync();

                    // Add new suppliers
                    foreach (string supplierDto in dto.MedicineSuppliers)
                    {
                        MedicineSupplier medicineSupplier = new MedicineSupplier
                        {
                            MedicineId = medicine.Id,
                            SupplierId = supplierDto
                        };
                        await _unitOfWork.GetRepository<MedicineSupplier>().InsertAsync(medicineSupplier);
                    }
                    await _unitOfWork.SaveAsync();
                }

                await transaction.CommitAsync();

                // Reload medicine to get updated data including suppliers
                medicine = await _unitOfWork.GetRepository<Medicines>()
                    .GetEntities
                    .Include(m => m.MedicineSuppliers)
                        .ThenInclude(ms => ms.Suppliers)
                    .FirstOrDefaultAsync(m => m.Id == id);

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
                    IsActive = medicine.IsActive,
                    QuantityRequired = _unitOfWork.GetRepository<VaccinationPlan>()
                       .GetEntities
                       .Where(p => p.MedicineId == medicine.Id && p.IsActive
                       && p.DeleteTime == null && p.Status == "pending")
                       .Count(),
                    Suppliers = medicine.MedicineSuppliers.Select(ms => new SupplierModelView
                    {
                        Id = ms.Suppliers.Id,
                        Name = ms.Suppliers.Name,
                        Email = ms.Suppliers.Email,
                        Phone = ms.Suppliers.Phone,
                        Address = ms.Suppliers.Address
                    }).ToList(),
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, ex.Message);
            }
        }
    }
}