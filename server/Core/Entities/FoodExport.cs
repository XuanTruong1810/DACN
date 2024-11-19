using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class FoodExport : BaseEntity
    {
        public DateTimeOffset ExportDate { get; set; }
        public string ExportBy { get; set; }

        public string Note { get; set; }

        public string AreaName { get; set; } // Tên khu vực 
        [InverseProperty("FoodExport")]
        public virtual ICollection<FoodExportDetail> FoodExportDetails { get; set; } = new List<FoodExportDetail>();
    }

}