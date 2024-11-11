
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
    }
}