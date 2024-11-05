using Application.DTOs;
using Application.Models;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class SuppliersController(ISupplierService supplierService) : ControllerBase
    {
        private readonly ISupplierService supplierService = supplierService;

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Get([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string[]? typeSuppliers = null,
            [FromQuery] string? status = null)
        {
            BasePagination<SupplierModelView>? data = await supplierService.GetSupplierAsync(
                pageIndex,
                pageSize,
                searchTerm,
                typeSuppliers,
                status
            );
            return Ok(BaseResponse<BasePagination<SupplierModelView>>.OkResponse(data));
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(string id)
        {
            SupplierModelView? data = await supplierService.GetSupplierByIdAsync(id);
            return Ok(BaseResponse<SupplierModelView>.OkResponse(data));
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddSupplier([FromBody] SupplierDTO supplierModel)
        {
            SupplierModelView? result = await supplierService.AddSupplierAsync(supplierModel);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, BaseResponse<SupplierModelView>.CreatedResponse(result));

        }
        [HttpPatch]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSupplier([FromQuery] string id, [FromBody] SupplierDTO supplierModel)
        {
            SupplierModelView? result = await supplierService.UpdateSupplierAsync(id, supplierModel);
            return Ok(BaseResponse<SupplierModelView>.OkResponse(result));
        }
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSupplier([FromQuery] string id)
        {
            await supplierService.DeleteSupplierAsync(id);
            return Ok(BaseResponse<object>.OkResponse("Xóa nhà cung cấp thành công!"));
        }
    }
}