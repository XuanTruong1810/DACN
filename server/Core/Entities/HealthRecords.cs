using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class HealthRecords : BaseEntity
    {
        public DateTimeOffset RecordDate { get; set; }

        [InverseProperty("HealthRecords")]


        public string CreateBy { get; set; }
        public virtual ICollection<HealthRecordDetails> HealthRecordDetails { get; set; } = new List<HealthRecordDetails>();

    }
}