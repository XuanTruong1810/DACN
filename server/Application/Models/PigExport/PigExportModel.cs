namespace Application.Models.PigExport;

public class PigExportViewModel
{
    public string Id { get; set; }
    public string CustomerId { get; set; }
    public string CustomerName { get; set; }
    public DateTimeOffset ExportDate { get; set; }
    public string CreatedBy { get; set; }
    public decimal TotalWeight { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
    public List<PigExportDetailViewModel> Details { get; set; }
}

public class PigExportDetailViewModel
{
    public string Id { get; set; }
    public string PigId { get; set; }
    public decimal ActualWeight { get; set; }
    public decimal TotalAmount { get; set; }   // Thành tiền = ActualWeight * UnitPrice
}

// DTO để hiển thị danh sách phiếu xuất
public class PigExportListItemViewModel
{
    public string Id { get; set; }
    public string CustomerName { get; set; }
    public DateTimeOffset ExportDate { get; set; }
    public string CreatedBy { get; set; }
    public decimal TotalWeight { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal UnitPrice { get; set; }
    public int TotalPigs { get; set; }         // Tổng số heo
}
