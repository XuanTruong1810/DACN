using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class FoodImportRequestDetails
{
    public string FoodImportRequestId { get; set; }
    public string FoodId { get; set; }
    public int Quantity { get; set; }



    // Navigation properties
    [ForeignKey("Foods")]
    public virtual Foods Food { get; set; }
    [ForeignKey("FoodImportRequests")]
    public virtual FoodImportRequests FoodImportRequest { get; set; }

}