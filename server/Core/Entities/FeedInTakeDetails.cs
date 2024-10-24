using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class FeedInTakeDetails
    {
        [ForeignKey("FeedInTakes")]
        [Key, Column(Order = 0)]
        public string FeedInTakeId { get; set; }

        public virtual FeedInTakes FeedInTakes { get; set; }

        [ForeignKey("Feeds")]
        [Key, Column(Order = 1)]
        public string FeedId { get; set; }
        public virtual Feeds Feeds { get; set; }


        public decimal UnitPrice { get; set; }

        // Số lượng dự kiến
        [Required]
        public decimal ExpectedQuantity { get; set; }

        // số lượng giao tới

        public decimal? ReceivedQuantity { get; set; }
        // số lượng chấp thuận

        public decimal? AcceptedQuantity { get; set; }

        // số lượng bỏ

        public decimal? RejectedQuantity { get; set; }

    }
}