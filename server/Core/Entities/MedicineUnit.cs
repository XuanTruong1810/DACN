using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    // Đơn vị tính của thuốc
    public class MedicineUnit : BaseEntity
    {
        [ForeignKey("Medicines")]
        public string MedicineId { get; set; }
        [ForeignKey("Unit")]
        public string UnitId { get; set; }
        public string UnitName { get; set; }        // Tên hiển thị (vd: Chai 500ml, Hộp 10 viên)
        public decimal Quantity { get; set; }       // Số lượng tồn kho
        public decimal ConversionRate { get; set; } // Tỷ lệ quy đổi với đơn vị cơ bản
        public bool IsBaseUnit { get; set; }        // Là đơn vị cơ bản không
        public bool IsActive { get; set; } = true; // Đang hoạt động

        // Navigation properties
        public virtual Medicines Medicines { get; set; }
        public virtual Unit Unit { get; set; }
        [InverseProperty("MedicineUnit")]
        public virtual ICollection<MedicineSupplier> MedicineSuppliers { get; set; }
    }
}