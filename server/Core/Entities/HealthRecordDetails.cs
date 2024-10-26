using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class HealthRecordDetails
    {

        [ForeignKey("HealthRecords")]
        public string HealthRecordId { get; set; }
        public virtual HealthRecords HealthRecords { get; set; }


        [ForeignKey("Pigs")]
        public string PigId { get; set; }
        public virtual Pigs Pigs { get; set; }



        [ForeignKey("MedicationAndVaccines")]
        public string? MedVacId { get; set; }
        public virtual MedicationAndVaccines MedicationAndVaccines { get; set; }


        public double Weight { get; set; }

        public string HealthStatus { get; set; }

        public string CreateBy { get; set; }
        public string? Note { get; set; }


        public DateTimeOffset NextCheckupDate { get; set; }
    }
}