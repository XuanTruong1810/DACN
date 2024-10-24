using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AreasController(IAreaService areaService) : ControllerBase
    {
        private readonly IAreaService areaService = areaService;
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Get()
        {
            BasePagination<AreaModelView> areas = await areaService.GetAllAsync(1, 10);
            return Ok(BaseResponse<BasePagination<AreaModelView>>.OkResponse(areas));
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(string id)
        {
            AreaModelView? area = await areaService.GetByIdAsync(id);
            return Ok(BaseResponse<AreaModelView>.OkResponse(area));
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post([FromBody] AreaDTO areaModel)
        {
            await areaService.CreateAsync(areaModel);
            return Ok(BaseResponse<object>.OkResponse("Created successfully"));
        }

        [HttpPatch]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Patch([FromQuery] string id, [FromBody] AreaDTO areaModel)
        {
            await areaService.UpdateAsync(id, areaModel);
            return Ok(BaseResponse<object>.OkResponse("Updated successfully"));
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            await areaService.DeleteAsync(id);
            return Ok(BaseResponse<object>.OkResponse("Deleted successfully"));
        }
    }
}