using Application.DTOs;
using Application.Models;
using Core.Base;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class SuppliersController(ISupplierService supplierService) : ControllerBase
    {
        private readonly ISupplierService supplierService = supplierService;

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            BasePagination<SupplierModelView>? data = await supplierService.GetSupplierAsync(pageIndex, pageSize);
            return Ok(BaseResponse<BasePagination<SupplierModelView>>.OkResponse(data));
        }
        [HttpPost]
        public async Task<IActionResult> AddSupplier([FromBody] SupplierDTO supplierModel)
        {
            await supplierService.AddSupplierAsync(supplierModel);
            return Ok(BaseResponse<object>.OkResponse("Created successfully"));
        }
        [HttpPatch]
        public async Task<IActionResult> UpdateSupplier([FromQuery] string id, [FromBody] SupplierDTO supplierModel)
        {
            await supplierService.UpdateSupplierAsync(id, supplierModel);
            return Ok(BaseResponse<object>.OkResponse("Update successfully"));
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteSupplier([FromQuery] string id)
        {
            await supplierService.DeleteSupplierAsync(id);
            return Ok(BaseResponse<object>.OkResponse("Delete successfully"));
        }
    }
}