using System;

// Dùng cho danh sách phiếu cân
public class PigWeighingListItemModelView
{
    public string Id { get; set; }
    public string Code { get; set; }  // Mã phiếu: WEI20240320A
    public string AreaId { get; set; }
    public string AreaName { get; set; }
    public DateTimeOffset WeighingDate { get; set; }
    public string WeighedBy { get; set; }
    public string WeighedByName { get; set; }
    public string Status { get; set; }
    public string StatusText => GetStatusText(Status);  // "Đang cân", "Hoàn thành"...

    public int TotalPigs { get; set; }
    public decimal TotalWeight { get; set; }
    public decimal? AverageWeight { get; set; }

    private string GetStatusText(string status) => status switch
    {
        "Draft" => "Nháp",
        "InProgress" => "Đang cân",
        "Completed" => "Hoàn thành",
        "Cancelled" => "Đã hủy",
        _ => status
    };
}