using PigManagement.Application.Models.Statistics;

public interface IPerformanceStatisticsService
{
    Task<List<StablePerformanceStats>> GetStablePerformanceAsync(DateTime startDate, DateTime endDate);
    Task<OverallPerformanceStats> GetOverallPerformanceAsync(DateTime startDate, DateTime endDate);
    Task<List<WeightGrowthStats>> GetWeightGrowthStatsAsync(DateTime startDate, DateTime endDate);
}