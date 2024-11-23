using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigExamination : BaseEntity
    {
        public DateTimeOffset ExaminationDate { get; set; } // ngày khám

        [InverseProperty("PigExamination")]
        public virtual List<PigExaminationDetail> PigExaminationDetails { get; set; }
    }
}