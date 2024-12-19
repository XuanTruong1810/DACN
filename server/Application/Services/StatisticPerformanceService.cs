using Castle.Core.Logging;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace Application.Services;

public class StatisticPerformanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StatisticPerformanceService> _logger;

    public StatisticPerformanceService(IUnitOfWork unitOfWork, ILogger<StatisticPerformanceService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<StatisticPerformanceResponse> GetStatisticPerformance(DateTime fromDate, DateTime toDate)
    {
        List<Pigs>? pigs = await _unitOfWork
        .GetRepository<Pigs>()
        .GetEntities
        .Where(x => x.CreatedTime >= fromDate && x.CreatedTime <= toDate)
        .ToListAsync();

        List<FoodExport>? foodRecords = await _unitOfWork.GetRepository<FoodExport>().GetEntities
        .Where(x => x.CreatedTime >= fromDate && x.CreatedTime <= toDate)
        .ToListAsync();

        int totalPigs = pigs.Count(); // Tổng số heo
        decimal totalFoodExport = foodRecords.Sum(f => f.FoodExportDetails.Sum(fd => fd.Quantity)); // Tổng lượng thức ăn (kg)
        decimal? averageWeight = pigs.Average(p => p.Weight); // Trọng lượng TB (kg)
        decimal? fcr = totalFoodExport / pigs.Sum(p => p.Weight); // Hệ số chuyển đổi thức ăn
        decimal? efficiency = pigs.Sum(p => p.Weight) / totalFoodExport; // Hiệu suất (%)

        return new StatisticPerformanceResponse
        {
            TotalPigs = totalPigs,
            AverageWeight = (decimal)averageWeight,
            FCR = (decimal)fcr,
            Efficiency = (decimal)efficiency
        };
    }
    public async Task<RadarChartResponse> RadarChart(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // Lấy dữ liệu kỳ hiện tại
            RadarChartStats? currentPeriodStats = await CalculateRadarStats(fromDate, toDate);

            // Tính khoảng thời gian để lấy dữ liệu kỳ trước
            TimeSpan periodLength = toDate - fromDate;
            DateTime previousFromDate = fromDate.AddDays(-periodLength.Days);
            DateTime previousToDate = fromDate.AddDays(-1);

            // Lấy dữ liệu kỳ trước
            RadarChartStats? previousPeriodStats = await CalculateRadarStats(previousFromDate, previousToDate);

            return new RadarChartResponse
            {
                Current = currentPeriodStats,
                Previous = previousPeriodStats
            };
        }
        catch (BaseException ex)
        {
            throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, $"Error generating radar chart data: {ex.Message}");
        }
    }
    private DateTime? ExtractDateFromCode(string code)
    {
        try
        {
            if (string.IsNullOrEmpty(code) || code.Length < 10)
                return null;

            string dateStr = code.Substring(2, 8); // Lấy 8 ký tự từ vị trí 2: "YYYYMMDD"
            return DateTime.ParseExact(dateStr, "yyyyMMdd", CultureInfo.InvariantCulture);
        }
        catch
        {
            return null;
        }
    }

    private async Task<RadarChartStats> CalculateRadarStats(DateTime fromDate, DateTime toDate)
    {
        // Lấy dữ liệu heo và phiếu cân trong khoảng thời gian
        List<Pigs>? pigs = await _unitOfWork.GetRepository<Pigs>().GetEntities
            .Include(p => p.WeighingDetails)
            .Where(p => p.CreatedTime >= fromDate &&
                       p.CreatedTime <= toDate)
            .ToListAsync();

        // Lấy dữ liệu thức ăn trong khoảng thời gian
        List<FoodExport>? foodRecords = await _unitOfWork.GetRepository<FoodExport>().GetEntities
            .Where(f => f.CreatedTime >= fromDate &&
                       f.CreatedTime <= toDate)
            .Include(f => f.FoodExportDetails)
            .ToListAsync();

        // 1. Tính tăng trọng trung bình (kg/ngày)
        IEnumerable<decimal>? weightGains = pigs.Select(p =>
        {
            var weightNotes = p.WeighingDetails
                .Select(w => new
                {
                    Weight = w.Weight,
                    DateOfCode = ExtractDateFromCode(w.WeighingHistoryId),
                    PigId = p.Id
                })
                .Where(w => w.DateOfCode.HasValue)
                .OrderBy(w => w.DateOfCode);

            var firstWeight = weightNotes.FirstOrDefault();

            // Lấy phiếu cân gần nhất trong khoảng thời gian
            var lastWeight = weightNotes
                .Where(w => w.DateOfCode <= toDate)
                .OrderByDescending(w => w.DateOfCode)
                .FirstOrDefault();

            if (firstWeight == null || lastWeight == null || firstWeight == lastWeight)
                return 0;

            int daysRaised = ((DateTime)lastWeight.DateOfCode - (DateTime)firstWeight.DateOfCode).Days;
            if (daysRaised <= 0) return 0;

            return (lastWeight.Weight - firstWeight.Weight) / daysRaised;
        });

        // Các phần còn lại giữ nguyên
        decimal averageWeightGain = weightGains.Any() ? weightGains.Average() : 0;

        _logger.LogInformation("Average weight gain: {averageWeightGain}", averageWeightGain);



        decimal totalFoodWeight = foodRecords.Sum(f => f.FoodExportDetails.Sum(fd => fd.Quantity));
        decimal totalWeightGain = weightGains.Sum();
        decimal fcr = totalWeightGain > 0 ? totalFoodWeight / totalWeightGain : 0;

        int totalPigs = pigs.Count;
        int alivePigs = pigs.Count(p => p.Status == "alive");
        decimal survivalRate = totalPigs > 0 ? (decimal)alivePigs / totalPigs * 100 : 0;

        decimal efficiency = fcr > 0 ? (1 / fcr) * 100 : 0;

        return new RadarChartStats
        {
            WeightGain = Math.Round((decimal)averageWeightGain, 2),
            FCR = Math.Round((decimal)fcr, 2),
            SurvivalRate = Math.Round(survivalRate, 2),
            Efficiency = Math.Round(efficiency, 2)
        };


    }


    public async Task<List<FCRByAreaResponse>> GetFCRByArea(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // Lấy danh sách các khu vực
            List<Areas>? areas = await _unitOfWork.GetRepository<Areas>().GetEntities
                .Include(a => a.Stables)
                    .ThenInclude(s => s.Pigs)
                        .ThenInclude(p => p.WeighingDetails)
                            .ThenInclude(w => w.WeighingHistory)
            .Where(a => a.DeleteTime == null && a.Id != "AREA0004")
            .ToListAsync();

            _logger.LogInformation("Processing {AreaCount} areas for period {FromDate} to {ToDate}",
                areas.Count, fromDate, toDate);

            List<FCRByAreaResponse>? result = new List<FCRByAreaResponse>();

            foreach (Areas area in areas)
            {
                _logger.LogInformation("Processing area: {AreaId} - {AreaName}", area.Id, area.Name);

                // Lấy danh sách heo trong khu vực
                var pigs = area.Stables
                    .SelectMany(s => s.Pigs)
                    .Where(p => p.CreatedTime >= fromDate &&
                               p.CreatedTime <= toDate)
                    .ToList();

                _logger.LogInformation("Found {PigCount} pigs in area {AreaId}", pigs.Count, area.Id);

                // Lấy dữ liệu thức ăn
                List<FoodExport>? foodRecords = await _unitOfWork.GetRepository<FoodExport>().GetEntities
                    .Include(f => f.FoodExportDetails)
                    .Where(f => f.CreatedTime >= fromDate &&
                               f.CreatedTime <= toDate &&
                               f.AreaName == area.Name)
                    .ToListAsync();

                decimal totalFoodWeight = foodRecords.Sum(f =>
                    f.FoodExportDetails.Sum(fd => fd.Quantity));

                _logger.LogInformation("Area {AreaId} total food: {Food}kg", area.Id, totalFoodWeight);

                // Tính tổng tăng trọng
                decimal totalWeightGain = 0;
                foreach (Pigs pig in pigs)
                {
                    decimal weightGain = 1;
                    if (weightGain > 0)
                    {
                        totalWeightGain += weightGain;
                        _logger.LogDebug("Pig {PigId} weight gain: {Gain}kg", pig.Id, weightGain);
                    }
                }

                _logger.LogInformation("Area {AreaId} total weight gain: {Gain}kg", area.Id, totalWeightGain);

                // Tính FCR
                decimal actualFCR = 0;
                if (totalWeightGain > 0 && totalFoodWeight > 0)
                {
                    actualFCR = totalFoodWeight / totalWeightGain;
                    _logger.LogInformation("Area {AreaId} FCR = {Food}kg / {Gain}kg = {FCR}",
                        area.Id, totalFoodWeight, totalWeightGain, actualFCR);
                }

                result.Add(new FCRByAreaResponse
                {
                    AreaId = area.Id,
                    AreaName = area.Name,
                    ActualFCR = Math.Round(actualFCR, 2),
                    TargetFCR = 2.7M
                });
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating FCR by area");
            throw;
        }
    }

    private decimal CalculatePigWeightGain(Pigs pig, DateTime fromDate, DateTime toDate)
    {
        try
        {
            var weightNotes = pig.WeighingDetails
                .Select(w => new
                {
                    Weight = w.Weight,
                    Date = ExtractDateFromCode(w.WeighingHistory.Id)
                })
                .Where(w => w.Date.HasValue &&
                           w.Date.Value >= fromDate &&
                           w.Date.Value <= toDate)
                .OrderBy(w => w.Date)
                .ToList();

            _logger.LogDebug("Pig {PigId} has {Count} weight records in period",
                pig.Id, weightNotes.Count);

            if (weightNotes.Count >= 2)
            {
                var firstWeight = weightNotes.First();
                var lastWeight = weightNotes.Last();

                if (lastWeight.Weight > firstWeight.Weight)
                {
                    var gain = lastWeight.Weight - firstWeight.Weight;
                    _logger.LogDebug("Pig {PigId}: {FirstWeight}kg -> {LastWeight}kg = {Gain}kg",
                        pig.Id, firstWeight.Weight, lastWeight.Weight, gain);
                    return gain;
                }
            }

            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating weight gain for pig {PigId}", pig.Id);
            return 0;
        }
    }








    public class FCRByAreaResponse
    {
        public string AreaId { get; set; }    // Mã khu vực/chuồng
        public string AreaName { get; set; }   // Tên khu vực/chuồng
        public decimal ActualFCR { get; set; } // FCR thực tế
        public decimal TargetFCR { get; set; } // FCR mục tiêu
    }
    public class StatisticPerformanceResponse
    {
        public int TotalPigs { get; set; } // Tổng số heo
        public decimal AverageWeight { get; set; } // Trọng lượng TB (kg) 
        public decimal FCR { get; set; } // Hệ số chuyển đổi thức ăn
        public decimal Efficiency { get; set; } // Hiệu suất (%)
    }

    public class RadarChartResponse
    {
        public RadarChartStats Current { get; set; }    // Kỳ hiện tại
        public RadarChartStats Previous { get; set; }   // Kỳ trước
    }

    public class RadarChartStats
    {
        public decimal WeightGain { get; set; }     // Tăng trọng (kg)
        public decimal FCR { get; set; }            // Hệ số chuyển đổi thức ăn
        public decimal SurvivalRate { get; set; }   // Tỷ lệ sống (%)
        public decimal Efficiency { get; set; }     // Hiệu suất (%)
    }

    public class AreaPerformanceResponse
    {
        public string AreaName { get; set; }       // Khu vực
        public int TotalPigs { get; set; }         // Tổng heo
        public decimal AverageWeight { get; set; } // Trọng lượng TB
        public decimal FCR { get; set; }           // Hệ số FCR
        public decimal DeathRate { get; set; }     // Tỷ lệ chết (%)
        public decimal Efficiency { get; set; }    // Hiệu suất (%)
    }

    public async Task<List<AreaPerformanceResponse>> GetAreaPerformance(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // Lấy danh sách các khu vực và chuồng
            List<Areas>? areas = await _unitOfWork.GetRepository<Areas>().GetEntities
                .Include(a => a.Stables)
                    .ThenInclude(s => s.Pigs)
            .Where(a => a.DeleteTime == null && a.Id != "AREA004")
            .ToListAsync();

            List<AreaPerformanceResponse>? result = new List<AreaPerformanceResponse>();

            foreach (Areas area in areas)
            {
                // Gom tất cả heo trong khu vực
                List<Pigs>? pigsInArea = area.Stables
                    .Where(s => s.DeleteTime == null)
                    .SelectMany(s => s.Pigs)
                    .Where(p => p.CreatedTime >= fromDate &&
                               p.CreatedTime <= toDate)
                    .ToList();

                if (!pigsInArea.Any()) continue;

                // 1. Tổng số heo trong khu vực
                int totalPigs = pigsInArea.Count;

                // 2. Trọng lượng trung bình của khu vực
                decimal averageWeight = pigsInArea.Average(p => p.Weight ?? 0);

                // 3. Tính FCR cho cả khu vực
                List<FoodExport>? foodRecords = await _unitOfWork.GetRepository<FoodExport>().GetEntities
                    .Include(f => f.FoodExportDetails)
                    .Where(f => f.CreatedTime >= fromDate &&
                               f.CreatedTime <= toDate &&
                               f.AreaName == area.Name)
                    .ToListAsync();

                decimal totalFood = foodRecords.Sum(f =>
                    f.FoodExportDetails.Sum(fd => fd.Quantity));

                decimal totalWeight = pigsInArea.Sum(p => p.Weight ?? 0);
                decimal fcr = totalWeight > 0 ? totalFood / totalWeight : 0;

                // 4. Tỷ lệ chết của khu vực
                int deadPigs = pigsInArea.Count(p => p.Status == "dead");
                decimal deathRate = totalPigs > 0 ?
                    (decimal)deadPigs / totalPigs * 100 : 0;

                // 5. Hiệu suất của khu vực
                decimal efficiency = fcr > 0 ? (1 / fcr) * 100 : 0;

                result.Add(new AreaPerformanceResponse
                {
                    AreaName = area.Name,
                    TotalPigs = totalPigs,
                    AverageWeight = Math.Round(averageWeight, 2),
                    FCR = Math.Round(fcr, 2),
                    DeathRate = Math.Round(deathRate, 2),
                    Efficiency = Math.Round(efficiency, 2)
                });
            }

            return result.OrderBy(r => r.AreaName).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating area performance");
            throw;
        }
    }
}