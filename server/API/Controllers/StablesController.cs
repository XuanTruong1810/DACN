namespace API.Controllers
{
    using Application.DTOs;
    using Application.Interfaces;
    using Application.Models;
    using Core.Base;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/v1/[controller]")]
    public class StablesController(IStableService stableService) : ControllerBase
    {
        private readonly IStableService stableService = stableService;

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Get([FromQuery] string? areaId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            BasePagination<StableModelView>? result = await stableService.GetAllStablesByArea(pageIndex, pageSize, areaId);
            return Ok(BaseResponse<BasePagination<StableModelView>>.OkResponse(result));

        }
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetStableById(string id)
        {
            StableModelView? result = await stableService.GetStableById(id);
            return Ok(BaseResponse<StableModelView>.OkResponse(result));
        }


        [HttpPost]
        [Authorize]

        public async Task<IActionResult> Post(StableDTO stableDTO)
        {
            StableModelView? result = await stableService.InsertStable(stableDTO);
            return CreatedAtAction(nameof(GetStableById), new { id = result.Id }, BaseResponse<StableModelView>.CreatedResponse(result));
        }

        [HttpPatch("{id}")]
        [Authorize]

        public async Task<IActionResult> Patch(string id, StableDTO stableDTO)
        {
            StableModelView? result = await stableService.UpdateStable(id, stableDTO);
            return Ok(BaseResponse<StableModelView>.OkResponse(result)); ;
        }

        [HttpDelete("{id}")]
        [Authorize]

        public async Task<IActionResult> Delete(string id)
        {
            await stableService.DeleteStable(id);
            return Ok(BaseResponse<object>.OkResponse("Xóa chuồng thành công"));
        }
    }
}