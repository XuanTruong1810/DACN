
namespace PigManagement.Application.Models.Statistics;
public class PerformanceOverview
{
    public double AverageDailyGain { get; set; } // Tăng trọng TB (kg/ngày)
    public double AverageFCR { get; set; } // FCR trung bình
    public double MarketingRate { get; set; } // Tỷ lệ xuất chuồng
    public double HouseEfficiency { get; set; } // Hiệu suất chuồng
    public double PreviousAverageDailyGain { get; set; } // Cho phép tính % thay đổi
    public double StandardFCR { get; set; } // FCR chuẩn để so sánh
    public double TargetMarketingRate { get; set; } // Tỷ lệ xuất chuồng mục tiêu
}

public class HousePerformance
{
    public string HouseId { get; set; }
    public string HouseName { get; set; }
    public int TotalPigs { get; set; }
    public double AverageWeight { get; set; }
    public double FCR { get; set; }
    public double MortalityRate { get; set; }
    public double Efficiency { get; set; }
}

public class WeightGrowthData
{
    public string Week { get; set; }
    public double ActualWeight { get; set; }
    public double TargetWeight { get; set; }
}

public class PerformanceIndicator
{
    public string Metric { get; set; }
    public double CurrentValue { get; set; }
    public double PreviousValue { get; set; }
    public double TargetValue { get; set; }
}

public class HouseFCR
{
    public string HouseName { get; set; }
    public double ActualFCR { get; set; }
    public double TargetFCR { get; set; }
}

public class StablePerformanceStats
{
    public string StableId { get; set; }
    public string StableName { get; set; }
    public int TotalPigs { get; set; }
    public decimal AverageWeight { get; set; }
    public decimal FCR { get; set; }
    public decimal MortalityRate { get; set; }
    public decimal Efficiency { get; set; }
    public string AreaName { get; set; }
}

public class OverallPerformanceStats
{
    public int TotalPigs { get; set; }
    public int TotalStables { get; set; }
    public decimal AverageWeight { get; set; }
    public decimal AverageFCR { get; set; }
    public decimal OverallMortalityRate { get; set; }
    public int TotalDeadPigs { get; set; }
    public int TotalSoldPigs { get; set; }
    public decimal AverageEfficiency { get; set; }
}

public class WeightGrowthStats
{
    public DateTimeOffset Date { get; set; }
    public decimal AverageWeight { get; set; }
    public int PigCount { get; set; }
}