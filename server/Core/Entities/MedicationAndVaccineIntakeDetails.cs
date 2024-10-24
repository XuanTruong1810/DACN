using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class MedicationAndVaccineIntakeDetails
    {
        [ForeignKey("MedicationAndVaccineIntakes")]
        public string MedVacIntakeId { get; set; }
        [Key, Column(Order = 0)]
        public virtual MedicationAndVaccineIntakes MedicationAndVaccineIntakes { get; set; }


        [ForeignKey("MedicationAndVaccines")]
        [Key, Column(Order = 1)]
        public string MedVacId { get; set; }

        public virtual MedicationAndVaccines MedicationAndVaccines { get; set; }


        public decimal UnitPrice { get; set; }

        [Required]
        public int ExpectedQuantity { get; set; }

        public int? ReceivedQuantity { get; set; }

        public int? AcceptedQuantity { get; set; }


        public int? RejectedQuantity { get; set; }
    }
}