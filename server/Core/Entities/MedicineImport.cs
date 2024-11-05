using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class MedicineImport
    {
        [Key]
        public string Id { get; set; }
        [Required]
        [ForeignKey("RequestMedicine")]
        public string RequestMedicineId { get; set; }  // Bắt buộc phải có phiếu đề xuất

        [Required]
        [ForeignKey("Supplier")]
        public string SupplierId { get; set; }  // Bắt buộc phải có nhà cung cấp

        public string CreatedBy { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
        public ImportStatus Status { get; set; }
        public decimal TotalAmount { get; set; }

        // Navigation properties
        public virtual RequestMedicine RequestMedicine { get; set; }
        public virtual Suppliers Suppliers { get; set; }
        public virtual ICollection<MedicineImportDetail> MedicineImportDetails { get; set; } = new List<MedicineImportDetail>();
    }
    public enum ImportStatus
    {
        Pending,
        Completed,
        Rejected
    }
}