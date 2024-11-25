using Application.DTOs;
using Application.Models;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class SupplierService(IUnitOfWork unitOfWork, IMapper mapper) : ISupplierService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;

        public async Task<BasePagination<SupplierModelView>> GetSupplierAsync(
            int pageIndex,
            int pageSize,
            string? searchTerm = null,
            string[]? typeSuppliers = null,
            string? status = null)
        {
            IQueryable<Suppliers> supplierQuery = unitOfWork.GetRepository<Suppliers>()
                .GetEntities
                .Where(s => s.DeleteTime == null);

            // Lọc theo tên hoặc email hoặc số điện thoại
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower().Trim();
                supplierQuery = supplierQuery.Where(s =>
                    s.Name.ToLower().Contains(searchTerm) ||
                    s.Email.ToLower().Contains(searchTerm) ||
                    s.Phone.Contains(searchTerm)
                );
            }

            // Lọc theo mảng loại nhà cung cấp
            if (typeSuppliers != null && typeSuppliers.Length > 0)
            {
                string[]? lowerTypeSuppliers = typeSuppliers.Select(t => t.ToLower().Trim()).ToArray();
                supplierQuery = supplierQuery.Where(s =>
                    lowerTypeSuppliers.Contains(s.TypeSuppier.ToLower())
                );
            }

            // Lọc theo trạng thái
            if (!string.IsNullOrWhiteSpace(status))
            {
                status = status.ToLower().Trim();
                supplierQuery = supplierQuery.Where(s =>
                    s.Status.ToLower() == status
                );
            }

            // Sắp xếp theo tên
            supplierQuery = supplierQuery.OrderBy(s => s.Name);

            int totalCount = await supplierQuery.CountAsync();
            // if (totalCount == 0)
            // {
            //     throw new BaseException(
            //         StatusCodeHelper.NotFound,
            //         ErrorCode.NotFound,
            //         "Không tìm thấy nhà cung cấp nào phù hợp với điều kiện tìm kiếm"
            //     );
            // }

            BasePagination<Suppliers> basePagination = await unitOfWork.GetRepository<Suppliers>()
                .GetPagination(supplierQuery, pageIndex, pageSize);

            List<SupplierModelView> supplierModels = mapper.Map<List<SupplierModelView>>(
                basePagination.Items.ToList()
            );

            return new BasePagination<SupplierModelView>(
                supplierModels,
                totalCount,
                pageIndex,
                pageSize
            );
        }
        public async Task<SupplierModelView> GetSupplierByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Invalid id");
            }
            Suppliers? suppliers = await unitOfWork.GetRepository<Suppliers>().GetEntities.Where(s => s.DeleteTime == null).FirstOrDefaultAsync(s => s.Id == id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không thể tìm thấy nhà cung cấp này");
            return mapper.Map<SupplierModelView>(suppliers);
        }
        public async Task<SupplierModelView> AddSupplierAsync(SupplierDTO supplierModel)
        {
            Suppliers? supplierExist = await unitOfWork.GetRepository<Suppliers>().GetEntities
            .FirstOrDefaultAsync(s => s.Name.ToLower() == supplierModel.Name.ToLower()
            && s.DeleteTime == null);
            if (supplierExist is not null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Nhà cung cấp này đã tồn tại");
            }

            // Get latest supplier to generate new ID
            Suppliers? latestSupplier = await unitOfWork.GetRepository<Suppliers>()
                .GetEntities
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            string newId;
            if (latestSupplier == null)
            {
                newId = "SUP0001";
            }
            else
            {
                int currentNumber = int.Parse(latestSupplier.Id[3..]);
                newId = $"SUP{(currentNumber + 1):D4}";
            }

            Suppliers? supplier = mapper.Map<Suppliers>(supplierModel);
            supplier.Id = newId;
            await unitOfWork.GetRepository<Suppliers>().InsertAsync(supplier);

            // Check supplier type and add to corresponding table
            if (supplierModel.TypeSuppier.ToLower() == "food")
            {
                List<FoodSuppliers>? foodSuppliers = supplierModel.Permissions.Select(p => new FoodSuppliers
                {
                    SuppliersId = newId,
                    FoodsId = p,
                    Status = "active"
                }).ToList();
                await unitOfWork.GetRepository<FoodSuppliers>().InsertRangeAsync(foodSuppliers);
            }
            else if (supplierModel.TypeSuppier.ToLower() == "medicine")
            {
                List<MedicineSupplier>? medicineSuppliers = supplierModel.Permissions.Select(p => new MedicineSupplier
                {
                    SupplierId = newId,
                    MedicineId = p,
                    Status = true
                }).ToList();
                await unitOfWork.GetRepository<MedicineSupplier>().InsertRangeAsync(medicineSuppliers);
            }

            await unitOfWork.SaveAsync();

            return mapper.Map<SupplierModelView>(supplier);
        }

        public async Task<SupplierModelView> UpdateSupplierAsync(string id, SupplierDTO supplierModel)
        {
            if (string.IsNullOrEmpty(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
            }

            if (supplierModel == null)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Supplier data is required");
            }

            // Get supplier by id
            var supplier = await unitOfWork.GetRepository<Suppliers>()
                .GetEntities
                .FirstOrDefaultAsync(s => s.Id == id && s.DeleteTime == null);

            if (supplier == null)
            {
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không thể tìm thấy nhà cung cấp này");
            }
            if (supplier.Name != supplierModel.Name)
            {
                var existingSupplier = await unitOfWork.GetRepository<Suppliers>()
                    .GetEntities
                    .FirstOrDefaultAsync(s =>
                        s.Name.ToLower() == supplierModel.Name.ToLower() &&
                        s.Id != id &&
                        s.DeleteTime == null
                    );

                if (existingSupplier != null)
                {
                    throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Tên nhà cung cấp đã tồn tại");
                }
            }

            // Update supplier properties
            supplier.Name = supplierModel.Name;
            supplier.Email = supplierModel.Email;
            supplier.Phone = supplierModel.Phone;
            supplier.Address = supplierModel.Address;
            supplier.TypeSuppier = supplierModel.TypeSuppier;
            supplier.Status = supplierModel.Status;
            supplier.UpdatedTime = DateTimeOffset.Now;

            // Save changes
            await unitOfWork.GetRepository<Suppliers>().UpdateAsync(supplier);
            await unitOfWork.SaveAsync();

            // Map to view model and return
            return mapper.Map<SupplierModelView>(supplier);
        }

        public async Task DeleteSupplierAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Invalid id");
            }
            Suppliers? supplier = await unitOfWork.GetRepository<Suppliers>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Supplier not found");
            supplier.DeleteTime = DateTimeOffset.Now;

            await unitOfWork.GetRepository<Suppliers>().UpdateAsync(supplier);
            await unitOfWork.SaveAsync();
        }
    }
}