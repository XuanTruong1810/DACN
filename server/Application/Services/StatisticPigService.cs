using Castle.Core.Logging;
using Core.Entities;
using Core.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services;

public class StatisticPigService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StatisticPigService> _logger;

    public StatisticPigService(IUnitOfWork unitOfWork, ILogger<StatisticPigService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public class PigStatisticResponse
    {
        public int TotalPigs { get; set; }            // Tổng đàn hiện tại
        public decimal GrowthRate { get; set; }       // Tỷ lệ tăng trưởng so với tháng trước (%)
        public ImportExportStats Import { get; set; } // Thống kê nhập
        public ImportExportStats Export { get; set; } // Thống kê xuất
        public DeathStats Death { get; set; }         // Thống kê heo chết
    }

    public class ImportExportStats
    {
        public int Quantity { get; set; }         // Số lượng
        public decimal TotalValue { get; set; }    // Tổng giá trị
    }

    public class DeathStats
    {
        public int Quantity { get; set; }         // Số lượng chết
        public decimal Rate { get; set; }         // Tỷ lệ chết (%)
    }

    public async Task<PigStatisticResponse> GetPigStatistics(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // 1. Tổng đàn hiện tại
            var currentPigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
                .Where(p => p.DeleteTime == null && p.Status != "dead")
                .CountAsync();

            // 2. Tính tỷ lệ tăng trưởng
            DateTime lastMonthStart = fromDate.AddMonths(-1);
            DateTime lastMonthEnd = fromDate.AddDays(-1);

            int lastMonthPigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
                .Where(p => p.CreatedTime >= lastMonthStart &&
                           p.CreatedTime <= lastMonthEnd &&
                           p.Status != "dead")
                .CountAsync();

            decimal growthRate = 0;
            if (lastMonthPigs > 0)
            {
                // Tính tỷ lệ tăng trưởng
                decimal rawGrowthRate = ((decimal)currentPigs - lastMonthPigs) / lastMonthPigs * 100;

                // Làm tròn và giới hạn ở mức +/- 100%
                growthRate = Math.Min(Math.Max(Math.Round(rawGrowthRate, 2), -100), 100);

                _logger.LogInformation(
                    "Growth rate: raw={RawRate}%, capped={CappedRate}%",
                    rawGrowthRate, growthRate);
            }

            // 3. Thống kê nhập trong kỳ
            List<PigIntakes>? imports = await _unitOfWork.GetRepository<PigIntakes>().GetEntities
                .Where(i => i.CreatedTime >= fromDate &&
                           i.CreatedTime <= toDate)
                .ToListAsync();

            ImportExportStats? importStats = new ImportExportStats
            {
                Quantity = imports.Sum(i => i.AcceptedQuantity.GetValueOrDefault()),
                TotalValue = imports.Sum(i => i.TotalPrice.GetValueOrDefault())
            };

            // 4. Thống kê xuất trong kỳ
            List<PigExport>? exports = await _unitOfWork.GetRepository<PigExport>().GetEntities
                .Where(e => e.CreatedTime >= fromDate &&
                           e.CreatedTime <= toDate)
                .ToListAsync();

            ImportExportStats? exportStats = new ImportExportStats
            {
                Quantity = exports.Sum(e => e.Details.Count),
                TotalValue = exports.Sum(e => e.TotalAmount)
            };

            // 5. Thống kê heo chết
            int deadPigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
                .Where(p => p.Status == "dead" &&
                           p.UpdatedTime >= fromDate &&
                           p.UpdatedTime <= toDate)
                .CountAsync();

            DeathStats? deathStats = new DeathStats
            {
                Quantity = deadPigs,
                Rate = currentPigs > 0
                    ? Math.Round((decimal)deadPigs / currentPigs * 100, 2)
                    : 0
            };

            return new PigStatisticResponse
            {
                TotalPigs = currentPigs,
                GrowthRate = Math.Round(growthRate, 2),
                Import = importStats,
                Export = exportStats,
                Death = deathStats
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating pig statistics");
            throw;
        }
    }

    public class PigTrendResponse
    {
        public string Month { get; set; }          // Tháng (T1-T12)
        public int TotalPigs { get; set; }         // Tổng đàn
        public int ImportQuantity { get; set; }    // Số lượng nhập
        public int ExportQuantity { get; set; }    // Số lượng xuất  
        public int DeathQuantity { get; set; }     // Số lượng chết
    }

    public async Task<List<PigTrendResponse>> GetPigTrend(DateTime fromDate, DateTime toDate)
    {
        try
        {
            List<PigTrendResponse>? result = new List<PigTrendResponse>();

            // Lặp qua 12 tháng
            for (int month = 1; month <= 12; month++)
            {
                DateTime firstDayOfMonth = new DateTime(fromDate.Year, month, 1);
                DateTime lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

                // 1. Tổng đàn cuối tháng
                int totalPigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
                    .Where(p => p.CreatedTime <= lastDayOfMonth &&
                               (p.DeleteTime == null || p.DeleteTime > lastDayOfMonth) &&
                               (p.Status != "dead" ||
                                (p.Status == "dead" && p.UpdatedTime > lastDayOfMonth)))
                    .CountAsync();

                // 2. Số lượng nhập trong tháng
                List<PigIntakes>? imports = await _unitOfWork.GetRepository<PigIntakes>().GetEntities
                    .Where(i => i.CreatedTime >= firstDayOfMonth &&
                               i.CreatedTime <= lastDayOfMonth)
                    .ToListAsync();

                int importQuantity = imports.Sum(i => i.AcceptedQuantity.GetValueOrDefault());

                // 3. Số lượng xuất trong tháng
                List<PigExport>? exports = await _unitOfWork.GetRepository<PigExport>().GetEntities
                    .Where(e => e.CreatedTime >= firstDayOfMonth &&
                               e.CreatedTime <= lastDayOfMonth)
                    .ToListAsync();

                int exportQuantity = exports.Sum(e => e.Details.Count);

                // 4. Số lượng chết trong tháng
                int deathQuantity = await _unitOfWork.GetRepository<Pigs>().GetEntities
                    .Where(p => p.Status == "dead" &&
                               p.UpdatedTime >= firstDayOfMonth &&
                               p.UpdatedTime <= lastDayOfMonth)
                    .CountAsync();

                result.Add(new PigTrendResponse
                {
                    Month = $"T{month}",
                    TotalPigs = totalPigs,
                    ImportQuantity = importQuantity,
                    ExportQuantity = exportQuantity,
                    DeathQuantity = deathQuantity
                });

                _logger.LogInformation(
                    "Month {Month}: Total={Total}, Import={Import}, Export={Export}, Death={Death}",
                    month, totalPigs, importQuantity, exportQuantity, deathQuantity);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pig trend statistics");
            throw;
        }
    }

    public class PigDistributionResponse
    {
        public string AreaName { get; set; }    // Tên khu vực
        public int PigCount { get; set; }       // Số lượng heo
        public decimal Percentage { get; set; }  // Tỷ lệ phần trăm
    }

    public async Task<List<PigDistributionResponse>> GetPigDistribution(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // Lấy danh sách các khu vực và số lượng heo
            List<Areas>? areas = await _unitOfWork.GetRepository<Areas>().GetEntities
                .Include(a => a.Stables)
                    .ThenInclude(s => s.Pigs)
                .Where(a => a.DeleteTime == null && a.Id != "AREA0004")
                .ToListAsync();

            List<PigDistributionResponse>? result = new List<PigDistributionResponse>();
            int totalPigs = 0;

            foreach (Areas area in areas)
            {
                int pigCount = area.Stables
                    .Where(s => s.DeleteTime == null)
                    .SelectMany(s => s.Pigs)
                    .Count(p => p.DeleteTime == null && p.Status != "dead" && p.CreatedTime >= fromDate && p.CreatedTime <= toDate);

                result.Add(new PigDistributionResponse
                {
                    AreaName = area.Name,
                    PigCount = pigCount,
                    Percentage = 0
                });

                totalPigs += pigCount;
            }
            if (totalPigs > 0)
            {
                foreach (PigDistributionResponse item in result)
                {
                    item.Percentage = Math.Round((decimal)item.PigCount / totalPigs * 100, 2);
                    _logger.LogInformation(
                        "Area {Area}: {Count} pigs ({Percentage}%)",
                        item.AreaName, item.PigCount, item.Percentage);
                }
            }

            return result.OrderByDescending(r => r.PigCount).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating pig distribution");
            throw;
        }
    }

    public class PigWeightDistributionResponse
    {
        public string Range { get; set; }      // Khoảng trọng lượng
        public int PigCount { get; set; }      // Số lượng heo
    }

    public async Task<List<PigWeightDistributionResponse>> GetPigWeightDistribution(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // Lấy danh sách heo còn sống
            var pigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
                .Where(p => p.DeleteTime == null &&
                           p.Status != "dead" &&
                           p.CreatedTime >= fromDate &&
                           p.CreatedTime <= toDate)
                .ToListAsync();

            // Định nghĩa các khoảng trọng lượng
            var weightRanges = new List<PigWeightDistributionResponse>
            {
                new PigWeightDistributionResponse
                {
                    Range = "0-30kg",
                    PigCount = pigs.Count(p => p.Weight >= 0 && p.Weight < 30)
                },
                new PigWeightDistributionResponse
                {
                    Range = "30-80kg",
                    PigCount = pigs.Count(p => p.Weight >= 30 && p.Weight < 80)
                },
                new PigWeightDistributionResponse
                {
                    Range = "80-100kg",
                    PigCount = pigs.Count(p => p.Weight >= 80 && p.Weight < 100)
                },
                new PigWeightDistributionResponse
                {
                    Range = ">100kg",
                    PigCount = pigs.Count(p => p.Weight >= 100)
                }
            };

            // Log thông tin
            foreach (var range in weightRanges)
            {
                _logger.LogInformation(
                    "Weight range {Range}: {Count} pigs",
                    range.Range, range.PigCount);
            }

            return weightRanges;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating pig weight distribution");
            throw;
        }
    }

    public class PerformanceMetricsResponse
    {
        public WeightGainStats WeightGain { get; set; }    // Tăng trọng
        public FcrStats Fcr { get; set; }                  // FCR
        public SurvivalStats Survival { get; set; }        // Tỷ lệ xuất chuồng
        public EfficiencyStats Efficiency { get; set; }    // Hiệu suất chuồng
    }

    public class WeightGainStats
    {
        public decimal Value { get; set; }           // kg/ngày
        public decimal GrowthRate { get; set; }      // % so với tháng trước
    }

    public class FcrStats
    {
        public decimal Value { get; set; }           // kg thức ăn/kg tăng trọng
        public decimal Difference { get; set; }      // Chênh lệch so với chuẩn
    }

    public class SurvivalStats
    {
        public decimal Rate { get; set; }            // % xuất chuồng
        public decimal Difference { get; set; }      // % so với mục tiêu
    }

    public class EfficiencyStats
    {
        public decimal Rate { get; set; }            // % hiệu suất
        public bool ReachedTarget { get; set; }      // Đạt mục tiêu hay không
    }

    public async Task<PerformanceMetricsResponse> GetPerformanceMetrics(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // 1. Tính tăng trọng TB/ngày
            decimal weightGain = await CalculateAverageWeightGain(fromDate, toDate);
            decimal lastMonthGain = await CalculateAverageWeightGain(
                fromDate.AddMonths(-1),
                toDate.AddMonths(-1));

            decimal growthRate = lastMonthGain > 0
                ? ((weightGain - lastMonthGain) / lastMonthGain) * 100
                : 0;

            // 2. Tính FCR trung bình
            decimal fcr = await CalculateAverageFCR(fromDate, toDate);
            decimal standardFcr = 2.8M; // FCR chuẩn
            decimal fcrDiff = standardFcr - fcr;

            // 3. Tính tỷ lệ xuất chuồng
            decimal survivalRate = await CalculateSurvivalRate(fromDate, toDate);
            decimal targetRate = 97M; // Mục tiêu
            decimal survivalDiff = survivalRate - targetRate;

            // 4. Tính hiệu suất chuồng
            decimal efficiency = await CalculateStableEfficiency(fromDate, toDate);
            bool reachedTarget = efficiency >= 80; // Mục tiêu 80%

            return new PerformanceMetricsResponse
            {
                WeightGain = new WeightGainStats
                {
                    Value = Math.Round(weightGain, 2),
                    GrowthRate = Math.Round(growthRate, 1)
                },
                Fcr = new FcrStats
                {
                    Value = Math.Round(fcr, 1),
                    Difference = Math.Round(fcrDiff, 1)
                },
                Survival = new SurvivalStats
                {
                    Rate = Math.Round(survivalRate, 1),
                    Difference = Math.Round(survivalDiff, 1)
                },
                Efficiency = new EfficiencyStats
                {
                    Rate = Math.Round(efficiency, 1),
                    ReachedTarget = reachedTarget
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating performance metrics");
            throw;
        }
    }

    private async Task<decimal> CalculateAverageWeightGain(DateTime fromDate, DateTime toDate)
    {
        // Lấy tất cả chi tiết cân từ lịch sử
        var weightDetails = await _unitOfWork.GetRepository<WeighingHistory>().GetEntities
            .Where(w => w.CreatedTime >= fromDate && w.CreatedTime <= toDate)
            .SelectMany(w => w.WeighingDetails)
            .ToListAsync();

        if (!weightDetails.Any()) return 0;

        decimal totalGain = weightDetails.Sum(d => d.Weight);
        int days = (toDate - fromDate).Days;

        return days > 0 ? Math.Round(totalGain / days, 2) : 0;
    }

    private async Task<decimal> CalculateAverageFCR(DateTime fromDate, DateTime toDate)
    {
        // Lấy tất cả chi tiết xuất thức ăn
        var foodDetails = await _unitOfWork.GetRepository<FoodExport>().GetEntities
            .Where(f => f.CreatedTime >= fromDate && f.CreatedTime <= toDate)
            .SelectMany(f => f.FoodExportDetails)
            .ToListAsync();

        // Lấy tất cả chi tiết cân
        var weightDetails = await _unitOfWork.GetRepository<WeighingHistory>().GetEntities
            .Where(w => w.CreatedTime >= fromDate && w.CreatedTime <= toDate)
            .SelectMany(w => w.WeighingDetails)
            .ToListAsync();

        decimal totalFood = foodDetails.Sum(d => d.Quantity);
        decimal totalWeightGain = weightDetails.Sum(d => d.Weight);

        return totalWeightGain > 0 ? Math.Round(totalFood / totalWeightGain, 2) : 0;
    }

    private async Task<decimal> CalculateSurvivalRate(DateTime fromDate, DateTime toDate)
    {
        var totalPigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
            .Where(p => p.CreatedTime >= fromDate && p.CreatedTime <= toDate)
            .CountAsync();

        var deadPigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
            .Where(p => p.Status == "dead" &&
                       p.UpdatedTime >= fromDate &&
                       p.UpdatedTime <= toDate)
            .CountAsync();

        if (totalPigs > 0)
        {
            return ((decimal)(totalPigs - deadPigs) / totalPigs) * 100;
        }

        return 0;
    }

    private async Task<decimal> CalculateStableEfficiency(DateTime fromDate, DateTime toDate)
    {
        // Tính hiệu suất dựa trên FCR và tỷ lệ sống
        var fcr = await CalculateAverageFCR(fromDate, toDate);
        var survivalRate = await CalculateSurvivalRate(fromDate, toDate);

        if (fcr > 0)
        {
            return (1 / fcr) * survivalRate;
        }

        return 0;
    }

    public class AreaEfficiencyResponse
    {
        public string AreaId { get; set; }         // Mã khu vực
        public string AreaName { get; set; }       // Tên khu vực
        public string Description { get; set; }    // Mô tả
        public int TotalPigs { get; set; }         // Tổng số heo
        public string StableUsage { get; set; }    // Số chuồng (đang dùng/tổng)
        public string Status { get; set; }         // Trạng thái
        public decimal OccupancyRate { get; set; } // Tỷ lệ lấp đầy (%)
    }

    public async Task<List<AreaEfficiencyResponse>> GetAreaEfficiency(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // Lấy danh sách khu vực và chuồng
            List<Areas>? areas = await _unitOfWork.GetRepository<Areas>().GetEntities
                .Include(a => a.Stables)
                    .ThenInclude(s => s.Pigs)
                .Where(a => a.DeleteTime == null)
                .ToListAsync();

            List<AreaEfficiencyResponse>? result = new List<AreaEfficiencyResponse>();

            foreach (Areas area in areas)
            {
                int totalStables = area.Stables.Count(s => s.DeleteTime == null);
                int usedStables = area.Stables
                    .Count(s => s.DeleteTime == null &&
                               s.Pigs.Any(p => p.DeleteTime == null && p.Status != "dead" && p.CreatedTime >= fromDate && p.CreatedTime <= toDate));

                // Đếm tổng số heo trong khu vực
                int pigCount = area.Stables
                    .Where(s => s.DeleteTime == null)
                    .SelectMany(s => s.Pigs)
                    .Count(p => p.DeleteTime == null && p.Status != "dead" && p.CreatedTime >= fromDate && p.CreatedTime <= toDate);

                // Tính tỷ lệ lấp đầy
                decimal occupancyRate = totalStables > 0
                    ? Math.Round((decimal)pigCount / (totalStables * 20) * 100, 1) // Giả sử mỗi chuồng chứa tối đa 20 con
                    : 0;

                result.Add(new AreaEfficiencyResponse
                {
                    AreaId = area.Id,
                    AreaName = area.Name,
                    Description = area.Description ?? "",
                    TotalPigs = pigCount,
                    StableUsage = $"{usedStables}/{totalStables}",
                    Status = "Đang hoạt động", // Có thể thêm logic xác định trạng thái
                    OccupancyRate = occupancyRate
                });

                _logger.LogInformation(
                    "Area {Area}: {PigCount} pigs, {UsedStables}/{TotalStables} stables, {Rate}% occupancy",
                    area.Name, pigCount, usedStables, totalStables, occupancyRate);
            }

            return result.OrderBy(r => r.AreaName).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating area efficiency");
            throw;
        }
    }
}