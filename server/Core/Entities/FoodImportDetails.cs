using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class FoodImportDetails
{
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    [Range(0, double.MaxValue)]
    public decimal ExpectedQuantity { get; set; } // dự kiến giao hàng
    [Range(0, double.MaxValue)]
    public decimal? DeliveredQuantity { get; set; } // số lượng giao hàng
    [Range(0, double.MaxValue)]
    public decimal? ActualQuantity { get; set; } // số lượng thực tế nhận
    [Range(0, double.MaxValue)]
    public decimal? RejectedQuantity { get; set; } // số lượng từ chối

    public string? Note { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey("FoodImports")]
    public string FoodImportId { get; set; }
    [ForeignKey("Foods")]
    public string FoodId { get; set; }
    public virtual FoodImports FoodImports { get; set; }
    public virtual Foods Food { get; set; }
}