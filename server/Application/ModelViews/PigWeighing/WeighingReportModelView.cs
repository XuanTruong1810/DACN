public class WeighingReportModelView
{
    public string AreaId { get; set; }
    public string AreaName { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }

    // Thống kê chung
    public int TotalWeighings { get; set; }
    public int TotalPigsWeighed { get; set; }
    public decimal TotalWeight { get; set; }
    public decimal AverageWeight { get; set; }

    // Thống kê tăng trọng
    public decimal AverageWeightGain { get; set; }
    public int NormalCount { get; set; }
    public int WarningCount { get; set; }
    public int CriticalCount { get; set; }

    // Thống kê theo chuồng
    public List<CageWeighingReportModelView> CageReports { get; set; }

    // Dữ liệu cho biểu đồ
    public List<ChartDataPoint> WeightChart { get; set; }
    public List<ChartDataPoint> WeightGainChart { get; set; }
}

public class CageWeighingReportModelView
{
    public string CageId { get; set; }
    public string CageCode { get; set; }
    public string HouseCode { get; set; }
    public int TotalPigs { get; set; }
    public decimal AverageWeight { get; set; }
    public decimal AverageWeightGain { get; set; }
    public List<WeighingItemModelView> PigDetails { get; set; }
}

public class ChartDataPoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public string Label { get; set; }
}