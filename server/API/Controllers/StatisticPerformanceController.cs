using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Server.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatisticPerformanceController : ControllerBase
{
    private readonly StatisticPerformanceService _statisticPerformanceService;

    public StatisticPerformanceController(StatisticPerformanceService statisticPerformanceService)
    {
        _statisticPerformanceService = statisticPerformanceService;
    }

    [HttpGet("performance")]
    public async Task<IActionResult> GetStatisticPerformance(DateTime fromDate, DateTime toDate)
    {
        StatisticPerformanceService.StatisticPerformanceResponse? result = await _statisticPerformanceService.GetStatisticPerformance(fromDate, toDate);
        return Ok(BaseResponse<StatisticPerformanceService.StatisticPerformanceResponse>.OkResponse(result));
    }
    [HttpGet("radar-chart")]
    public async Task<IActionResult> GetRadarChart(DateTime fromDate, DateTime toDate)
    {
        StatisticPerformanceService.RadarChartResponse? result = await _statisticPerformanceService.RadarChart(fromDate, toDate);
        return Ok(BaseResponse<StatisticPerformanceService.RadarChartResponse>.OkResponse(result));
    }
    [HttpGet("fcr-by-area")]
    public async Task<IActionResult> GetFCRByArea(DateTime fromDate, DateTime toDate)
    {
        List<StatisticPerformanceService.FCRByAreaResponse>? result = await _statisticPerformanceService.GetFCRByArea(fromDate, toDate);
        return Ok(BaseResponse<List<StatisticPerformanceService.FCRByAreaResponse>>.OkResponse(result));
    }
    [HttpGet("area-performance")]
    public async Task<IActionResult> GetAreaPerformance(DateTime fromDate, DateTime toDate)
    {
        List<StatisticPerformanceService.AreaPerformanceResponse>? result = await _statisticPerformanceService.GetAreaPerformance(fromDate, toDate);
        return Ok(BaseResponse<List<StatisticPerformanceService.AreaPerformanceResponse>>.OkResponse(result));
    }
}