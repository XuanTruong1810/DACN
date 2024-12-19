using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatisticInventoryController : ControllerBase
{
    private readonly StatisticInventoryService _statisticInventoryService;
    public StatisticInventoryController(StatisticInventoryService statisticInventoryService)
    {
        _statisticInventoryService = statisticInventoryService;
    }
    [HttpGet("inventory-statistics")]
    public async Task<IActionResult> GetInventoryStatistics(DateTime fromDate, DateTime toDate)
    {
        StatisticInventoryService.InventoryStatisticResponse? result = await _statisticInventoryService.GetInventoryStatistics(fromDate, toDate);
        return Ok(BaseResponse<StatisticInventoryService.InventoryStatisticResponse>.OkResponse(result));
    }
    [HttpGet("inventory-trend")]
    public async Task<IActionResult> GetInventoryTrend(DateTime fromDate, DateTime toDate)
    {
        StatisticInventoryService.InventoryTrendResponse? result = await _statisticInventoryService.GetInventoryTrend(fromDate, toDate);
        return Ok(BaseResponse<StatisticInventoryService.InventoryTrendResponse>.OkResponse(result));
    }
    [HttpGet("low-stock-items")]
    public async Task<IActionResult> GetLowStockItems(DateTime fromDate, DateTime toDate)
    {
        List<StatisticInventoryService.LowStockItemResponse> result = await _statisticInventoryService.GetLowStockItems(fromDate, toDate);
        return Ok(BaseResponse<List<StatisticInventoryService.LowStockItemResponse>>.OkResponse(result));
    }
}