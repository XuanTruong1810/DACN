using Application.DTOs.WeighingHistory;
using Application.Interfaces;
using Application.ModelViews.WeighingHistory;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeighingHistoryController : ControllerBase
{
    private readonly IWeighingHistoryService _weighingHistoryService;
    public WeighingHistoryController(IWeighingHistoryService weighingHistoryService)
    {
        _weighingHistoryService = weighingHistoryService;
    }
    [HttpGet]
    public async Task<IActionResult> GetAllWeighingHistories()
    {
        List<WeighingHistoryModelView>? result = await _weighingHistoryService.GetAllWeighingHistories();
        return Ok(BaseResponse<List<WeighingHistoryModelView>>.OkResponse(result));
    }
    [HttpPost]
    public async Task<IActionResult> CreateWeighingHistory([FromBody] CreateWeighingHistoryDto dto)
    {
        return Ok(BaseResponse<WeighingHistoryModelView>.OkResponse(await _weighingHistoryService.CreateWeighingHistory(dto)));
    }
}