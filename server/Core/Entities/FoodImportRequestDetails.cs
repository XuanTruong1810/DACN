using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class FoodImportRequestDetails
{
    public decimal ExpectedQuantity { get; set; }



    // Navigation properties
    [ForeignKey("Foods")]
    public string FoodId { get; set; }
    public virtual Foods Foods { get; set; }

    [ForeignKey("FoodImportRequests")]
    public string FoodImportRequestId { get; set; }
    public virtual FoodImportRequests FoodImportRequests { get; set; }

}