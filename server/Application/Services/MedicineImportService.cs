using Application.DTOs.MedicineImport;
using Application.Interfaces;
using Application.Models.MedicineImportModelView;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services
{
    public class MedicineImportService : IMedicineImportService
    {

        private readonly IUnitOfWork _unitOfWork;
        public MedicineImportService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<MedicineImportModelView> DeliveryMedicineImport(string id, MedicineImportAcceptIntakeDTO dto)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                MedicineImport? medicineImport = await _unitOfWork.GetRepository<MedicineImport>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.NotFound, "Không tìm thấy phiếu nhập thuốc");
                decimal totalAmount = 0;
                foreach (MedicineImportDetailAcceptIntakeDTO detail in dto.Details)
                {
                    MedicineImportDetail? medicineImportDetail = medicineImport.MedicineImportDetails
                    .FirstOrDefault(m => m.MedicineId == detail.MedicineId)
                     ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.NotFound, "Không tìm thấy chi tiết phiếu nhập thuốc");
                    if (detail.AcceptedQuantity > medicineImportDetail.ExpectedQuantity)
                    {
                        throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số lượng nhập vào không hợp lệ");
                    }
                    if (detail.AcceptedQuantity < 0)
                    {
                        throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số lượng nhập vào không hợp lệ");
                    }
                    if (detail.AcceptedQuantity > medicineImportDetail.ReceivedQuantity)
                    {
                        throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số lượng nhập vào không hợp lệ");
                    }
                    medicineImportDetail.AcceptedQuantity = detail.AcceptedQuantity;
                    medicineImportDetail.ReceivedQuantity = detail.ReceivedQuantity;

                    medicineImportDetail.RejectedQuantity = medicineImportDetail.ExpectedQuantity - medicineImportDetail.AcceptedQuantity;

                    medicineImportDetail.Amount = medicineImportDetail.AcceptedQuantity * medicineImportDetail.Price;
                    totalAmount += medicineImportDetail.Amount;

                    await _unitOfWork.GetRepository<MedicineImportDetail>().UpdateAsync(medicineImportDetail);

                }
                medicineImport.TotalAmount = totalAmount;
                medicineImport.ReceivedAmount = totalAmount - medicineImport.Deposit;
                medicineImport.DeliveryTime = dto.DeliveryTime;

                medicineImport.UpdatedTime = DateTimeOffset.Now;

                medicineImport.Status = ImportStatus.Completed;



                await _unitOfWork.GetRepository<MedicineImport>().UpdateAsync(medicineImport);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();
                return await GetMedicineImportById(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, ex.Message);
            }
        }


        public async Task<MedicineImportModelView> GetMedicineImportById(string id)
        {
            MedicineImport? medicineImport = await _unitOfWork.GetRepository<MedicineImport>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.NotFound, "Không tìm thấy phiếu nhập thuốc");
            return new MedicineImportModelView
            {
                Id = medicineImport.Id,
                SupplierId = medicineImport.SupplierId,
                SupplierName = medicineImport.Suppliers.Name,
                Status = medicineImport.Status,
                CreateTime = medicineImport.CreatedTime.GetValueOrDefault(),
                CreateBy = medicineImport.CreatedBy,
                DeliveryTime = medicineImport.DeliveryTime,
                StockTime = medicineImport.StockTime,
                TotalPrice = medicineImport.TotalAmount.GetValueOrDefault(),
                TotalReceivedQuantity = medicineImport.ReceivedAmount.GetValueOrDefault(),
                CreateByName = _unitOfWork.GetRepository<ApplicationUser>().GetByIdAsync(medicineImport.CreatedBy).Result?.FullName,
                ExpectedDeliveryTime = medicineImport.ExpectedDeliveryTime,
                Deposit = medicineImport.Deposit,
                Details = medicineImport.MedicineImportDetails.Select(mi => new MedicineImportDetailModelView
                {
                    MedicineId = mi.MedicineId,
                    MedicineName = mi.Medicines.MedicineName,
                    Unit = mi.Medicines.Unit,
                    IsVaccine = mi.Medicines.IsVaccine,
                    UnitPrice = mi.Price,
                    ExpectedQuantity = mi.ExpectedQuantity,
                    ActualQuantity = mi.AcceptedQuantity,
                    RejectQuantity = mi.RejectedQuantity.GetValueOrDefault(),
                    ReceivedQuantity = mi.ReceivedQuantity.GetValueOrDefault(),
                }).ToList()
            };
        }

        public async Task<List<MedicineImportModelView>> GetMedicineImports()
        {
            IEnumerable<MedicineImport>? medicineImports = await _unitOfWork.GetRepository<MedicineImport>().GetAllAsync();
            List<MedicineImportModelView>? result = medicineImports.Select(mi => new MedicineImportModelView
            {
                Id = mi.Id,
                SupplierId = mi.SupplierId,
                SupplierName = mi.Suppliers.Name,
                Status = mi.Status,
                CreateTime = mi.CreatedTime.GetValueOrDefault(),
                CreateBy = mi.CreatedBy,
                CreateByName = _unitOfWork.GetRepository<ApplicationUser>().GetByIdAsync(mi.CreatedBy).Result?.FullName,
                ExpectedDeliveryTime = mi.ExpectedDeliveryTime,
                Deposit = mi.Deposit,
                Details = mi.MedicineImportDetails.Select(mi => new MedicineImportDetailModelView
                {
                    MedicineId = mi.MedicineId,
                    MedicineName = mi.Medicines.MedicineName,
                    Unit = mi.Medicines.Unit,
                    IsVaccine = mi.Medicines.IsVaccine,
                    UnitPrice = mi.Price,
                    ExpectedQuantity = mi.ExpectedQuantity,
                    ActualQuantity = mi.AcceptedQuantity,
                    RejectQuantity = mi.RejectedQuantity.GetValueOrDefault(),
                    ReceivedQuantity = mi.ReceivedQuantity.GetValueOrDefault(),
                }).ToList()
            }).ToList();
            return result;
        }

        public async Task<MedicineImportModelView> StockMedicineImport(string id)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                MedicineImport? medicineImport = await _unitOfWork.GetRepository<MedicineImport>().GetByIdAsync(id)
                    ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.NotFound, "Không tìm thấy phiếu nhập thuốc");
                medicineImport.Status = ImportStatus.Stocked;
                medicineImport.StockTime = DateTimeOffset.Now;
                foreach (MedicineImportDetail detail in medicineImport.MedicineImportDetails)
                {
                    Medicines? medicine = await _unitOfWork.GetRepository<Medicines>().GetByIdAsync(detail.MedicineId)
                    ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.NotFound, "Không tìm thấy thuốc");
                    medicine.QuantityInStock += detail.AcceptedQuantity;
                    medicine.UpdatedTime = DateTimeOffset.Now;
                    await _unitOfWork.GetRepository<Medicines>().UpdateAsync(medicine);

                }
                medicineImport.UpdatedTime = DateTimeOffset.Now;
                await _unitOfWork.GetRepository<MedicineImport>().UpdateAsync(medicineImport);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();
                return await GetMedicineImportById(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, ex.Message);
            }
        }
    }
}