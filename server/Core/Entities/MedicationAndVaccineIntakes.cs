using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class MedicationAndVaccineIntakes : BaseEntity
    {
        [ForeignKey("Suppliers")]
        public string SuppliersId { get; set; }

        public virtual Suppliers Suppliers { get; set; }

        public decimal? Deposit { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? RemainingAmount { get; set; }

        public DateTimeOffset? ApprovedTime { get; set; }

        // Trạng thái ngày giao
        public DateTimeOffset? DeliveryDate { get; set; }


        public DateTimeOffset? IsInStock { get; set; }
        [Required]
        public string CreateBy { get; set; }

        [InverseProperty("MedicationAndVaccineIntakes")]
        public virtual ICollection<MedicationAndVaccineIntakeDetails> MedicationAndVaccineIntakeDetails { get; set; } = new List<MedicationAndVaccineIntakeDetails>();


    }
}