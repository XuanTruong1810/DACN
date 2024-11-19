
using Application.DTOs;
using Application.DTOs.Pig;
using Application.Interfaces;
using Application.Models;
using Application.Models.PigCancelModelView;
using Application.Models.PigExport;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PigsController(IPigService pigService) : ControllerBase
    {
        private readonly IPigService pigService = pigService;

        [HttpGet]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetAllAsync([FromQuery] PigFilterDTO filter)
        {
            BasePagination<PigModelView> pigs = await pigService.GetAllAsync(filter);
            return Ok(BaseResponse<BasePagination<PigModelView>>.OkResponse(pigs));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> CreateAsync(PigDTO dto)
        {
            PigModelView? pig = await pigService.CreateAsync(dto);
            return Ok(BaseResponse<PigModelView>.OkResponse(pig));
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetByIdAsync(string id)
        {
            PigModelView? pig = await pigService.GetByIdAsync(id);
            return Ok(BaseResponse<PigModelView>.OkResponse(pig));
        }

        [HttpGet("area/{areaId}")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetPigsByAreaAsync(string areaId)
        {
            List<PigModelView> pigs = await pigService.GetPigsByAreaAsync(areaId);
            return Ok(BaseResponse<List<PigModelView>>.OkResponse(pigs));
        }

        [HttpGet("house/{houseId}")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetPigsByHouseAsync(string houseId)
        {
            List<PigModelView> pigs = await pigService.GetPigsByHouseAsync(houseId);
            return Ok(BaseResponse<List<PigModelView>>.OkResponse(pigs));
        }

        [HttpPost("{id}/cancel")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> CancelPigAsync(string id, PigCancelDTO dto)
        {
            PigCancelModelView? pig = await pigService.CancelPigAsync(id, dto);
            return Ok(BaseResponse<PigCancelModelView>.OkResponse(pig));
        }

        [HttpGet("cancel")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetPigCancelAsync([FromQuery] int? pageIndex, [FromQuery] int? pageSize)
        {
            BasePagination<PigCancelModelView> pigs = await pigService.GetPigCancelAsync(pageIndex ?? 1, pageSize ?? 10);
            return Ok(BaseResponse<BasePagination<PigCancelModelView>>.OkResponse(pigs));
        }


        [HttpGet("export")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetPigsForExportAsync()
        {
            List<PigExportModelView> pigs = await pigService.GetPigsForExportAsync();
            return Ok(BaseResponse<List<PigExportModelView>>.OkResponse(pigs));
        }

        [HttpGet("export/pending")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetPigsStatusPendingAsync()
        {
            List<PigExportModelView> pigs = await pigService.GetPigsStatusPendingAsync();
            return Ok(BaseResponse<List<PigExportModelView>>.OkResponse(pigs));
        }

        [HttpGet("vaccination")]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> GetPigsVaccinationAsync([FromQuery] string? areaId, [FromQuery] string? stableId)
        {
            List<PigVaccinationModelView> pigs = await pigService.GetPigsVaccinationAsync(areaId, stableId);
            return Ok(BaseResponse<List<PigVaccinationModelView>>.OkResponse(pigs));
        }
    }
}