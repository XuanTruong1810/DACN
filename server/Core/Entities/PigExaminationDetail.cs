using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigExaminationDetail : BaseEntity
    {
        [ForeignKey("Pig")]
        public string PigId { get; set; } // id số lợn

        public virtual Pigs Pig { get; set; }

        public bool IsHealthy { get; set; } // trạng thái sức khỏe

        public string? Diagnosis { get; set; } // chuẩn đoán

        public string? HealthNote { get; set; } // ghi chú

        public string? TreatmentMethod { get; set; } // cách điều trị

        [ForeignKey("PigExamination")]
        public string PigExaminationId { get; set; }

        public virtual PigExamination PigExamination { get; set; }

        [InverseProperty("PigExaminationDetail")]
        public virtual List<PigExamninationMedicine> PigExamninationMedicines { get; set; }



    }
}