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

        public async Task<BasePagination<SupplierModelView>> GetSupplierAsync(int pageIndex, int pageSize)
        {
            IQueryable<Suppliers>? supplierQuery = unitOfWork.GetRepository<Suppliers>().GetEntities.Where(s => s.DeleteTime == null);

            int totalCount = await supplierQuery.CountAsync();
            if (totalCount == 0)
            {
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Suppliers not found");
            }

            BasePagination<Suppliers> basePagination = await unitOfWork.GetRepository<Suppliers>().GetPagination(supplierQuery, pageIndex, pageSize);

            List<SupplierModelView>? supplierModels = mapper.Map<List<SupplierModelView>>(basePagination.Items.ToList());

            BasePagination<SupplierModelView>? paginationResult = new(supplierModels, pageSize, pageIndex, totalCount);

            return paginationResult;

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
            Suppliers? supplier = mapper.Map<Suppliers>(supplierModel);
            await unitOfWork.GetRepository<Suppliers>().InsertAsync(supplier);
            await unitOfWork.SaveAsync();

            return mapper.Map<SupplierModelView>(supplierExist);

        }

        public async Task<SupplierModelView> UpdateSupplierAsync(string id, SupplierDTO supplierModel)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Invalid id");
            }
            Suppliers? supplier = await unitOfWork.GetRepository<Suppliers>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Supplier not found");


            Suppliers? existingSupplier = await unitOfWork.GetRepository<Suppliers>()
                .GetEntities.FirstOrDefaultAsync(s => s.Name == supplierModel.Name && s.Id != id);
            if (existingSupplier != null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Nhà cung cấp này đã tồn tại");
            }

            mapper.Map(supplierModel, supplier);
            await unitOfWork.SaveAsync();

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