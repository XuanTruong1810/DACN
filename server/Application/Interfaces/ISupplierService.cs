using Application.DTOs;
using Application.Models;
using Core.Base;

public interface ISupplierService
{
    Task<BasePagination<SupplierModelView>> GetSupplierAsync(int pageIndex, int pageSize);
    Task<SupplierModelView> GetSupplierByIdAsync(string id);
    Task AddSupplierAsync(SupplierDTO supplierModel);
    Task UpdateSupplierAsync(string id, SupplierDTO supplierModel);
    Task DeleteSupplierAsync(string id);

}