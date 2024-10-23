using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class MedicationAndVaccines : BaseEntity
    {
        public string MedVacName { get; set; }

        public string Type { get; set; }

        public int Quantity { get; set; } = 0;
        // nhà sản xuất
        public string Manufacturer { get; set; }
        // mô tả
        public string Description { get; set; }

        public string CreateBy { get; set; }
        public int DaysUsableAfterImport { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
        [InverseProperty("MedicationAndVaccines")]
        public virtual ICollection<MedicationAndVaccineIntakeDetails> MedicationAndVaccineIntakeDetails { get; set; } = new List<MedicationAndVaccineIntakeDetails>();
    }


}