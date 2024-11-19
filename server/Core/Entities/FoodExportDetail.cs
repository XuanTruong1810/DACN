using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class FoodExportDetail
    {
        public string FoodId { get; set; }
        public decimal Quantity { get; set; }

        public string FoodExportId { get; set; }

        [ForeignKey("FoodId")]
        public virtual Foods Food { get; set; }

        [ForeignKey("FoodExportId")]
        public virtual FoodExport FoodExport { get; set; }
    }
}