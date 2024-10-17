using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class FeedInTakes : BaseEntity
    {
        [ForeignKey("Suppliers")]
        public string SuppliersId { get; set; }

        public virtual Suppliers Suppliers { get; set; }

        // tổng tiền đã cọc
        public decimal? Deposit { get; set; }
        // tổng tiền phải trả cho hóa đơn
        public decimal? TotalPrice { get; set; }
        // Tổng tiền phải trả sau khi giao hàng
        public decimal? RemainingAmount { get; set; }

        // Trạng thái xác nhận của quản lý  
        public DateTimeOffset? ApprovedTime { get; set; }

        // Trạng thái ngày giao
        public DateTimeOffset? DeliveryDate { get; set; }


        public DateTimeOffset? IsInStock { get; set; }

        [Required]
        public string CreateBy { get; set; }
        [InverseProperty("FeedInTakes")]
        public virtual ICollection<FeedInTakeDetails> FeedInTakeDetails { get; set; } = new List<FeedInTakeDetails>();
    }
}