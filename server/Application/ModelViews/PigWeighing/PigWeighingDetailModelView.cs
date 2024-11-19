// Chi tiết một phiếu cân
public class PigWeighingDetailModelView
{
    public string Id { get; set; }
    public string Code { get; set; }
    public string AreaId { get; set; }
    public string AreaName { get; set; }
    public DateTimeOffset WeighingDate { get; set; }
    public string WeighedBy { get; set; }
    public string WeighedByName { get; set; }
    public string Status { get; set; }
    public string StatusText { get; set; }
    public string Note { get; set; }

    // Thông tin tổng hợp
    public int TotalPigs { get; set; }
    public decimal TotalWeight { get; set; }
    public decimal? AverageWeight { get; set; }
    public decimal? AverageWeightGain { get; set; }

    // Thống kê trạng thái
    public int NormalCount { get; set; }
    public int WarningCount { get; set; }
    public int CriticalCount { get; set; }

    // Chi tiết từng heo
    public List<WeighingItemModelView> Details { get; set; }
}

public class WeighingItemModelView
{
    public string Id { get; set; }
    public string PigId { get; set; }
    public string PigCode { get; set; }
    public string Gender { get; set; }  // Giới tính heo
    public int Age { get; set; }        // Số ngày tuổi

    public string CageId { get; set; }
    public string CageCode { get; set; }
    public string HouseCode { get; set; }  // Mã nhà

    public decimal Weight { get; set; }
    public decimal? PreviousWeight { get; set; }
    public decimal? WeightGain { get; set; }
    public string WeightGainText => GetWeightGainText();  // "+2.5 kg" hoặc "-0.5 kg"

    public string Status { get; set; }
    public string StatusClass => GetStatusClass();  // CSS class: "normal", "warning", "critical"
    public string StatusText => GetStatusText();    // "Bình thường", "Cảnh báo", "Nguy hiểm"

    public string Note { get; set; }

    private string GetWeightGainText()
    {
        if (!WeightGain.HasValue) return "-";
        var sign = WeightGain.Value >= 0 ? "+" : "";
        return $"{sign}{WeightGain.Value:F1} kg";
    }

    private string GetStatusClass() => Status?.ToLower() ?? "normal";

    private string GetStatusText() => Status switch
    {
        "Normal" => "Bình thường",
        "Warning" => "Cảnh báo",
        "Critical" => "Nguy hiểm",
        _ => Status
    };
}