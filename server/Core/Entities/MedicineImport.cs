using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class MedicineImport : BaseEntity
    {
        [Required]
        [ForeignKey("RequestMedicine")]
        public string RequestMedicineId { get; set; }  // Bắt buộc phải có phiếu đề xuất

        [Required]
        [ForeignKey("Suppliers")]
        public string SupplierId { get; set; }  // Bắt buộc phải có nhà cung cấp

        public string CreatedBy { get; set; }
        public ImportStatus Status { get; set; }
        public decimal? TotalAmount { get; set; }

        public decimal? ReceivedAmount { get; set; }

        public DateTimeOffset? DeliveryTime { get; set; } // Ngày giao hàng

        public DateTimeOffset? StockTime { get; set; } // Ngày nhập kho


        public string Receiver { get; set; } // Người nhận hàng

        public DateTimeOffset ExpectedDeliveryTime { get; set; } // Ngày dự kiến giao hàng
        public decimal Deposit { get; set; } // Tiền cọc


        // Navigation properties
        public virtual RequestMedicine RequestMedicine { get; set; }
        public virtual Suppliers Suppliers { get; set; }
        [InverseProperty("MedicineImport")]
        public virtual ICollection<MedicineImportDetail> MedicineImportDetails { get; set; } = new List<MedicineImportDetail>();
    }
    public enum ImportStatus
    {
        Pending, // Đang chờ
        Completed,
        Rejected,
        Stocked
    }
}