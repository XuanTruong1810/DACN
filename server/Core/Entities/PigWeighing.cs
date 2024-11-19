
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigWeighings : BaseEntity
    {

        public string AreaId { get; set; }
        [ForeignKey("AreaId")]
        public virtual Areas Area { get; set; }

        public DateTimeOffset WeighingDate { get; set; }
        public string WeighedBy { get; set; }
        public string Status { get; set; }  // Draft, InProgress, Completed, Cancelled
        public string Note { get; set; }

        // Thông tin tổng hợp
        public int TotalPigs { get; set; }  // Tổng số heo đã cân
        public decimal TotalWeight { get; set; }  // Tổng khối lượng
        public decimal? AverageWeight { get; set; }  // Trọng lượng trung bình
        public decimal? AverageWeightGain { get; set; }  // Tăng trọng trung bình

        [InverseProperty("PigWeighing")]
        public virtual ICollection<PigWeighingDetails> Details { get; set; } = new List<PigWeighingDetails>();
    }
}