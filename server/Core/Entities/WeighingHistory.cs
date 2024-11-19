using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class WeighingHistory : BaseEntity
    {
        public string AreaId { get; set; }
        [ForeignKey("AreaId")]
        public virtual Areas Area { get; set; }

        public DateTimeOffset ScheduledDate { get; set; }  // Ngày theo lịch
        public DateTimeOffset? ActualDate { get; set; }    // Ngày thực hiện
        public string Status { get; set; }                 // Completed, Pending, Skipped, Delayed
        public string Note { get; set; }
        public string HandledBy { get; set; }             // Người thực hiện/xử lý

        [InverseProperty("WeighingHistory")]
        public virtual ICollection<PigWeighing> PigWeighings { get; set; }
    }
}