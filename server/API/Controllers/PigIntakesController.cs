namespace API.Controllers
{
    using Application.DTOs;
    using Application.Interfaces;
    using Application.Models;
    using Application.Models.PigStable;
    using Core.Base;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/v1/[controller]")]
    public class PigIntakesController(IPigIntakeService pigIntakeService) : ControllerBase
    {
        private readonly IPigIntakeService pigIntakeService = pigIntakeService;

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Get([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, string? filter = null)
        {
            BasePagination<PigInTakeModelView>? data = await pigIntakeService.GetAllAsync(pageIndex, pageSize, filter);
            return Ok(BaseResponse<BasePagination<PigInTakeModelView>>.OkResponse(data));

        }
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(string id)
        {
            PigInTakeModelView? data = await pigIntakeService.GetPigIntakeByIdAsync(id);
            return Ok(BaseResponse<PigInTakeModelView>.OkResponse(data));
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Post([FromBody] PigIntakeInsertDTO dTO)
        {
            PigInTakeModelView? result = await pigIntakeService.InsertIntakeAsync(dTO);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        [HttpPatch("Accept")]
        [Authorize(Policy = "FullAccess")]
        public async Task<IActionResult> PatchAccept([FromQuery] string id, [FromBody] PigIntakeAcceptDTO model)
        {
            PigInTakeModelView? result = await pigIntakeService.AcceptIntakeAsync(id, model);
            return Ok(BaseResponse<PigInTakeModelView>.OkResponse(result));
        }

        [HttpPatch]
        [Authorize]
        public async Task<IActionResult> Patch([FromQuery] string id, [FromBody] PigIntakeUpdateDTO model)
        {
            PigDeliveryModel? result = await pigIntakeService.UpdateIntakeAsync(id, model);
            return Ok(BaseResponse<PigDeliveryModel>.OkResponse(result));
        }
        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Delete([FromQuery] string id)
        {
            await pigIntakeService.DeleteAsync(id);
            return Ok(BaseResponse<object>.OkResponse("Xóa thành công!"));
        }

        [HttpPost("Allocate")]
        [Authorize]
        public async Task<IActionResult> Allocate([FromQuery] string AreasId, [FromQuery] string pigIntakeId)
        {
            List<GetPigStableModelView>? result = await pigIntakeService.AllocatePigsToStableAsync(AreasId, pigIntakeId);
            return Ok(BaseResponse<List<GetPigStableModelView>>.OkResponse(result));
        }
    }
}