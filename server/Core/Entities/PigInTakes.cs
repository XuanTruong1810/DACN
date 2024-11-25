using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigIntakes : BaseEntity
    {

        public decimal? UnitPrice { get; set; }
        // tiền cọc
        public decimal? Deposit { get; set; }
        // tổng tiền phải trả
        public decimal? TotalPrice { get; set; }
        // tổng tiền đã cọc
        public decimal? RemainingAmount { get; set; }

        // Số lượng dự kiến
        [Required]
        public int ExpectedQuantity { get; set; }

        // số lượng giao tới

        public int? ReceivedQuantity { get; set; }
        // số lượng chấp thuận

        public int? AcceptedQuantity { get; set; }

        // số lượng bỏ

        public int? RejectedQuantity { get; set; }

        // Trạng thái xác nhận của quản lý  
        public DateTimeOffset? ApprovedTime { get; set; }
        public DateTimeOffset? DeliveryDate { get; set; }
        public DateTimeOffset? StokeDate { get; set; }

        public DateTimeOffset? ExpectedReceiveDate { get; set; } // ngày nhận dự kiến

        [Required]
        public string CreateBy { get; set; }

        [ForeignKey("Suppliers")]
        public string? SuppliersId { get; set; }

        public virtual Suppliers Suppliers { get; set; }

    }
}