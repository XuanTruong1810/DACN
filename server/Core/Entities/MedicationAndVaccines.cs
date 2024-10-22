namespace Core.Entities
{
    public class MedicationAndVaccines : BaseEntity
    {
        public string MedVacName { get; set; }

        public string Type { get; set; }

        public int Quantity { get; set; } = 0;
        public string Manufacturer { get; set; }
        public DateTime ExpiryDate { get; set; }
    }


}