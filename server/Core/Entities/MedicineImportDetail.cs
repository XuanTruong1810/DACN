using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    // Chi tiết nhập thuốc
    public class MedicineImportDetail : BaseEntity
    {
        public string ImportId { get; set; }
        public string MedicineId { get; set; }
        public string MedicineUnitId { get; set; }  // FK đến đơn vị tính cụ thể
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public string BatchNumber { get; set; }
        public DateTimeOffset ManufacturingDate { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }

        // Navigation properties
        public virtual MedicineImport Import { get; set; }
        public virtual Medicines Medicines { get; set; }
        public virtual MedicineUnit MedicineUnit { get; set; }
    }
}