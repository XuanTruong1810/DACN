using Application.Interfaces;
using Application.Models.CalenderWeighingModelView;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalenderWeighingController : ControllerBase
{
    private readonly ICalenderWeighingService _calenderWeighingService;
    public CalenderWeighingController(ICalenderWeighingService calenderWeighingService)
    {
        _calenderWeighingService = calenderWeighingService;
    }

    [HttpGet("calender-weighing")]
    [Authorize(Policy = "WeighPig")]
    public async Task<IActionResult> GetCalenderWeighingAsync()
    {
        List<CalenderWeighingModelView>? calenderWeighings = await _calenderWeighingService.GetCalenderWeighingAsync();
        return Ok(BaseResponse<List<CalenderWeighingModelView>>.OkResponse(calenderWeighings));
    }
}