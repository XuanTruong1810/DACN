using Application.DTOs.WeighingSchedule;
using Application.Interfaces;
using Application.ModelViews.WeighingSchedule;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WeighingScheduleController : ControllerBase
{
    private readonly IWeighingScheduleService _service;

    public WeighingScheduleController(IWeighingScheduleService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSchedule([FromBody] CreateWeighingScheduleDto dto)
    {
        WeighingScheduleModelView? result = await _service.CreateSchedule(dto);
        return Ok(BaseResponse<WeighingScheduleModelView>.OkResponse(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSchedule(string id, [FromBody] UpdateWeighingScheduleDto dto)
    {
        WeighingScheduleModelView? result = await _service.UpdateSchedule(dto);
        return Ok(BaseResponse<WeighingScheduleModelView>.OkResponse(result));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSchedule(string id)
    {
        bool result = await _service.DeleteSchedule(id);
        return Ok(BaseResponse<bool>.OkResponse(result));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> ToggleStatus(string id, [FromBody] bool isActive)
    {
        bool result = await _service.ToggleScheduleStatus(id, isActive);
        return Ok(BaseResponse<bool>.OkResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        WeighingScheduleModelView? result = await _service.GetScheduleById(id);
        return Ok(BaseResponse<WeighingScheduleModelView>.OkResponse(result));
    }

    [HttpGet("area/{areaId}")]
    public async Task<IActionResult> GetByArea(string areaId)
    {
        WeighingScheduleModelView? result = await _service.GetScheduleByArea(areaId);
        return Ok(BaseResponse<WeighingScheduleModelView>.OkResponse(result));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = false)
    {
        List<WeighingScheduleModelView>? result = activeOnly
            ? await _service.GetActiveSchedules()
            : await _service.GetAllSchedules();
        return Ok(BaseResponse<List<WeighingScheduleModelView>>.OkResponse(result));
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetAreasNeedWeighingToday()
    {
        List<string>? result = await _service.GetAreasNeedWeighingToday();
        return Ok(BaseResponse<List<string>>.OkResponse(result));
    }

    [HttpGet("next-date/{areaId}")]
    public async Task<IActionResult> GetNextWeighingDate(string areaId)
    {
        DateTime? result = await _service.GetNextWeighingDate(areaId);
        return Ok(BaseResponse<DateTime?>.OkResponse(result));
    }
}