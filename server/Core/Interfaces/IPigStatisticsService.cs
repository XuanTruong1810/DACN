using Core.Models.Statistics;

namespace Core.Interfaces
{
    public interface IPigStatisticsService
    {
        Task<PigOverviewStats> GetOverviewStatsAsync(DateTime startDate, DateTime endDate);
        Task<List<StablePerformanceDto>> GetStablePerformanceAsync();
        Task<List<WeightDistributionStats>> GetWeightDistributionAsync();
    }
}