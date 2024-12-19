using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatisticPigController : ControllerBase
{
    private readonly StatisticPigService _statisticPigService;

    public StatisticPigController(StatisticPigService statisticPigService)
    {
        _statisticPigService = statisticPigService;
    }

    [HttpGet("pig-statistic")]
    public async Task<IActionResult> GetPigStatistic(DateTime fromDate, DateTime toDate)
    {
        StatisticPigService.PigStatisticResponse? result = await _statisticPigService.GetPigStatistics(fromDate, toDate);
        return Ok(BaseResponse<StatisticPigService.PigStatisticResponse>.OkResponse(result));
    }
    [HttpGet("pig-trend")]
    public async Task<IActionResult> GetPigTrend(DateTime fromDate, DateTime toDate)
    {
        List<StatisticPigService.PigTrendResponse>? result = await _statisticPigService.GetPigTrend(fromDate, toDate);
        return Ok(BaseResponse<List<StatisticPigService.PigTrendResponse>>.OkResponse(result));
    }
    [HttpGet("pig-distribution")]
    public async Task<IActionResult> GetPigDistribution(DateTime fromDate, DateTime toDate)
    {
        List<StatisticPigService.PigDistributionResponse>? result = await _statisticPigService.GetPigDistribution(fromDate, toDate);
        return Ok(BaseResponse<List<StatisticPigService.PigDistributionResponse>>.OkResponse(result));
    }
    [HttpGet("pig-weight-distribution")]
    public async Task<IActionResult> GetPigWeightDistribution(DateTime fromDate, DateTime toDate)
    {
        List<StatisticPigService.PigWeightDistributionResponse>? result = await _statisticPigService.GetPigWeightDistribution(fromDate, toDate);
        return Ok(BaseResponse<List<StatisticPigService.PigWeightDistributionResponse>>.OkResponse(result));
    }
    [HttpGet("pig-fcr-distribution")]
    public async Task<IActionResult> GetPigFCRDistribution(DateTime fromDate, DateTime toDate)
    {
        StatisticPigService.PerformanceMetricsResponse? result = await _statisticPigService.GetPerformanceMetrics(fromDate, toDate);
        return Ok(BaseResponse<StatisticPigService.PerformanceMetricsResponse>.OkResponse(result));
    }
    [HttpGet("pig-area-efficiency")]
    public async Task<IActionResult> GetPigAreaEfficiency(DateTime fromDate, DateTime toDate)
    {
        List<StatisticPigService.AreaEfficiencyResponse>? result = await _statisticPigService.GetAreaEfficiency(fromDate, toDate);
        return Ok(BaseResponse<List<StatisticPigService.AreaEfficiencyResponse>>.OkResponse(result));
    }
}