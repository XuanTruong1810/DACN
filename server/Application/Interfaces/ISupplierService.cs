using Application.DTOs;
using Application.Models;
using Core.Base;

public interface ISupplierService
{
    Task<BasePagination<SupplierModelView>> GetSupplierAsync(int pageIndex, int pageSize);
    Task<SupplierModelView> GetSupplierByIdAsync(string id);
    Task<SupplierModelView> AddSupplierAsync(SupplierDTO supplierModel);
    Task<SupplierModelView> UpdateSupplierAsync(string id, SupplierDTO supplierModel);
    Task DeleteSupplierAsync(string id);

}