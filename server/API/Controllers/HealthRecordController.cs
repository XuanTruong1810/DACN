using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class HealthRecordController(IHealthRecordService healthRecordService) : ControllerBase
    {
        private readonly IHealthRecordService healthRecordService = healthRecordService;

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] HealthRecordCreateDto dto)
        {
            await healthRecordService.CreateHealthRecordAsync(dto);
            return Ok(BaseResponse<object>.OkResponse("Tạo phiếu thành công!"));
        }
    }
}