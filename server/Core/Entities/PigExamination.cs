using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigExamination : BaseEntity
    {
        public DateTimeOffset ExaminationDate { get; set; } // ngày khám



        public string CreatedBy { get; set; }

        public string? MedicineId { get; set; }

        [ForeignKey("MedicineId")]
        public virtual Medicines? Medicine { get; set; }

        public string? ExaminationType { get; set; } = "Regular"; // loại khám
        public string? ExaminationNote { get; set; } // ghi chú khám

        [InverseProperty("PigExamination")]
        public virtual List<PigExaminationDetail> PigExaminationDetails { get; set; }
    }
}