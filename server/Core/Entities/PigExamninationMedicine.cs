using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigExaminationMedicine
    {
        [ForeignKey("PigExaminationDetail")]
        public string PigExaminationDetailId { get; set; }

        public virtual PigExaminationDetail PigExaminationDetail { get; set; }

        [ForeignKey("Medicine")]
        public string MedicineId { get; set; }

        public virtual Medicines Medicine { get; set; }

        public double Quantity { get; set; } // số lượng dùng
    }
}