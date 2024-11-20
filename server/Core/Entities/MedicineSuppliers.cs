using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    // Bảng trung gian Thuốc - Nhà cung cấp
    public class MedicineSupplier
    {
        [ForeignKey("Medicines")]
        public string MedicineId { get; set; }
        [ForeignKey("Suppliers")]
        public string SupplierId { get; set; }
        public bool Status { get; set; } = true;

        public DateTimeOffset CreateTime { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeleteTime { get; set; }

        public DateTimeOffset? LastUpdateTime { get; set; }
        // Navigation properties

        public virtual Medicines Medicines { get; set; }
        public virtual Suppliers Suppliers { get; set; }
    }
}