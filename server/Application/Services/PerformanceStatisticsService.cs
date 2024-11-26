using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Repositories;
using Core.Entities;
using PigManagement.Application.Models.Statistics;

namespace server.Application.Services
{
    public class PerformanceStatisticsService : IPerformanceStatisticsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PerformanceStatisticsService> _logger;

        public PerformanceStatisticsService(IUnitOfWork unitOfWork, ILogger<PerformanceStatisticsService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<List<StablePerformanceStats>> GetStablePerformanceAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var stables = await _unitOfWork.GetRepository<Stables>()
                    .GetEntities
                    .Include(s => s.Areas)
                    .Include(s => s.Pigs)
                    .ThenInclude(p => p.WeighingDetails)
                    .Where(s => s.DeleteTime == null)
                    .ToListAsync();

                var stats = new List<StablePerformanceStats>();

                foreach (var stable in stables)
                {
                    // Tính số heo hiện tại
                    var currentPigs = stable.Pigs.Count(p =>
                        p.Status == "alive" &&
                        p.DeleteTime == null);

                    // Tính số heo chết
                    var deadPigs = stable.Pigs.Count(p =>
                        p.Status == "dead" &&
                        p.DeathDate >= startDate &&
                        p.DeathDate <= endDate);

                    // Tính tỷ lệ chết
                    var mortalityRate = currentPigs > 0
                        ? (decimal)deadPigs / currentPigs * 100
                        : 0;

                    // Tính trọng lượng trung bình
                    var avgWeight = stable.Pigs
                        .Where(p => p.Status == "alive")
                        .Select(p => p.Weight ?? 0)
                        .DefaultIfEmpty(0)
                        .Average();

                    // Tính FCR (giả định là 2.5 nếu chưa có dữ liệu thực)
                    var fcr = 2.5m;

                    // Tính hiệu suất
                    var efficiency = CalculateEfficiency(mortalityRate, fcr, stable.CurrentOccupancy, stable.Capacity);

                    stats.Add(new StablePerformanceStats
                    {
                        StableId = stable.Id,
                        StableName = stable.Name,
                        TotalPigs = currentPigs,
                        AverageWeight = avgWeight,
                        FCR = fcr,
                        MortalityRate = mortalityRate,
                        Efficiency = efficiency,
                        AreaName = stable.Areas.Name
                    });
                }

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating stable performance");
                throw;
            }
        }

        public async Task<OverallPerformanceStats> GetOverallPerformanceAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var stableStats = await GetStablePerformanceAsync(startDate, endDate);

                var totalPigs = await _unitOfWork.GetRepository<Pigs>()
                    .GetEntities
                    .CountAsync(p => p.Status == "alive" && p.DeleteTime == null);

                var deadPigs = await _unitOfWork.GetRepository<Pigs>()
                    .GetEntities
                    .CountAsync(p => p.Status == "dead" &&
                                    p.DeathDate >= startDate &&
                                    p.DeathDate <= endDate);

                var soldPigs = await _unitOfWork.GetRepository<Pigs>()
                    .GetEntities
                    .CountAsync(p => p.Status == "sold" &&
                                    p.SoldDate >= startDate &&
                                    p.SoldDate <= endDate);

                return new OverallPerformanceStats
                {
                    TotalPigs = totalPigs,
                    TotalStables = stableStats.Count,
                    AverageWeight = stableStats.Average(s => s.AverageWeight),
                    AverageFCR = stableStats.Average(s => s.FCR),
                    OverallMortalityRate = stableStats.Average(s => s.MortalityRate),
                    TotalDeadPigs = deadPigs,
                    TotalSoldPigs = soldPigs,
                    AverageEfficiency = stableStats.Average(s => s.Efficiency)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating overall performance");
                throw;
            }
        }

        private decimal CalculateEfficiency(decimal mortalityRate, decimal fcr, int currentOccupancy, int capacity)
        {
            // Trọng số cho từng yếu tố
            const decimal MORTALITY_WEIGHT = 0.4m;
            const decimal FCR_WEIGHT = 0.3m;
            const decimal OCCUPANCY_WEIGHT = 0.3m;

            // Tính điểm cho từng yếu tố (thang điểm 100)
            var mortalityScore = 100 - mortalityRate;
            var fcrScore = 100 - ((fcr - 2.5m) * 20); // 2.5 là FCR lý tưởng
            var occupancyScore = (decimal)currentOccupancy / capacity * 100;

            // Tính điểm tổng hợp
            return (mortalityScore * MORTALITY_WEIGHT) +
                   (fcrScore * FCR_WEIGHT) +
                   (occupancyScore * OCCUPANCY_WEIGHT);
        }

        public Task<List<WeightGrowthStats>> GetWeightGrowthStatsAsync(DateTime startDate, DateTime endDate)
        {
            throw new NotImplementedException();
        }
    }
}