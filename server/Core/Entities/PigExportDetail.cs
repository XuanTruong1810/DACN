using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigExportDetail : BaseEntity
    {
        public string PigExportId { get; set; }
        public string PigId { get; set; }                    // Mã heo
        public decimal ActualWeight { get; set; }            // Cân nặng thực tế

        [ForeignKey("PigId")]
        public virtual Pigs Pig { get; set; }
        [ForeignKey("PigExportId")]
        public virtual PigExport PigExport { get; set; }
    }
}