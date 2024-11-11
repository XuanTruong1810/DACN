using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class FoodImportDetails
{
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public decimal? ExpectedQuantity { get; set; } // dự kiến giao hàng
    public decimal? DeliveredQuantity { get; set; } // số lượng giao hàng

    public decimal? ActualQuantity { get; set; } // số lượng thực tế nhận

    public decimal? RejectedQuantity { get; set; } // số lượng từ chối

    public string? Note { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey("FoodImports")]
    public string FoodImportId { get; set; }
    [ForeignKey("Foods")]
    public string FoodId { get; set; }
    public FoodImports FoodImport { get; set; }
    public Foods Food { get; set; }
}