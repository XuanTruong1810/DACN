using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class MedicineImportDetail
    {
        [Key]
        [StringLength(450)]


        [ForeignKey("MedicineImport")]
        public string MedicineImportId { get; set; }

        [ForeignKey("Medicines")]
        public string MedicineId { get; set; }

        public decimal ExpectedQuantity { get; set; } // Số lượng dự kiến
        public decimal? ReceivedQuantity { get; set; }  // Số lượng thực nhận
        public decimal? RejectedQuantity { get; set; }  // Số lượng từ chối
        public decimal AcceptedQuantity { get; set; } // Số lượng chấp nhận

        public decimal Price { get; set; } // Đơn giá
        public decimal Amount { get; set; } // Thành tiền



        // Navigation properties
        public virtual MedicineImport MedicineImport { get; set; }
        public virtual Medicines Medicines { get; set; }
    }
}