using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    // Bảng trung gian Thuốc - Nhà cung cấp
    public class MedicineSupplier : BaseEntity
    {
        [ForeignKey("MedicineUnit")]
        public string MedicineUnitId { get; set; }
        [ForeignKey("Suppliers")]
        public string SupplierId { get; set; }
        public decimal DefaultPrice { get; set; }  // Giá nhập mặc định
        public bool IsMainSupplier { get; set; }  // Nhà cung cấp chính
        public string Note { get; set; }

        // Navigation properties
        public virtual MedicineUnit MedicineUnit { get; set; }
        public virtual Suppliers Suppliers { get; set; }
    }
}