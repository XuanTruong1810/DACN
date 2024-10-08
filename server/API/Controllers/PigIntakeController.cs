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
    public class PigIntakeController(IPigIntakeService pigIntakeService) : ControllerBase
    {
        private readonly IPigIntakeService pigIntakeService = pigIntakeService;

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Get([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, string? filter = null)
        {
            BasePagination<PigInTakeModelView>? data = await pigIntakeService.GetAllAsync(pageIndex, pageSize, filter);
            return Ok(BaseResponse<BasePagination<PigInTakeModelView>>.OkResponse(data));
        }
        [HttpGet("GetById")]
        [Authorize(Roles = "Admin,Dispatcher")]
        public async Task<IActionResult> GetById([FromQuery] string id)
        {
            PigInTakeModelView? data = await pigIntakeService.GetPigIntakeByIdAsync(id);
            return Ok(BaseResponse<PigInTakeModelView>.OkResponse(data));
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Dispatcher")]
        public async Task<IActionResult> Post([FromBody] PigIntakeInsertDTO dTO)
        {
            await pigIntakeService.InsertIntakeAsync(dTO);
            return Ok(BaseResponse<object>.OkResponse("Created successfully"));
        }
        [HttpPatch("Accept")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PatchAccept([FromQuery] string id, [FromBody] PigIntakeAcceptDTO model)
        {
            await pigIntakeService.AcceptIntakeAsync(id, model);
            return Ok(BaseResponse<object>.OkResponse("Accepted successfully"));
        }

        [HttpPatch]
        [Authorize(Roles = "Admin, Dispatcher")]
        public async Task<IActionResult> Patch([FromQuery] string id, [FromBody] PigIntakeUpdateDTO model)
        {
            await pigIntakeService.UpdateIntakeAsync(id, model);
            return Ok(BaseResponse<object>.OkResponse("Updated successfully"));
        }
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromQuery] string id)
        {
            await pigIntakeService.DeleteAsync(id);
            return Ok(BaseResponse<object>.OkResponse("Delete successfully"));
        }
    }
}