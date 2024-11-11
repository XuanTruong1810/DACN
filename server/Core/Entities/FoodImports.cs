using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class FoodImports : BaseEntity
{
    public decimal TotalAmount { get; set; }
    public decimal? DepositAmount { get; set; }

    public DateTimeOffset ExpectedDeliveryTime { get; set; }


    public string CreatedById { get; set; }

    public DateTimeOffset? DeliveredTime { get; set; }
    public string Status { get; set; } = "pending"; // pending, delivered, completed
    public string? Note { get; set; }


    // Navigation properties
    [ForeignKey("FoodImportRequests")]
    public string FoodImportRequestId { get; set; }
    [ForeignKey("Suppliers")]
    public string SupplierId { get; set; }
    public virtual FoodImportRequests FoodImportRequest { get; set; }
    public virtual Suppliers Supplier { get; set; }
    [InverseProperty("FoodImport")]
    public virtual ICollection<FoodImportDetails> FoodImportDetails { get; set; } = new List<FoodImportDetails>();

}