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


        public decimal UnitPrice { get; set; }

        [Required]
        public decimal ExpectedQuantity { get; set; }

        public decimal? ReceivedQuantity { get; set; }

        public decimal? AcceptedQuantity { get; set; }


        public decimal? RejectedQuantity { get; set; }
    }
}