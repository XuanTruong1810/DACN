namespace Application.Models
{
    public class MedVacGetModelView
    {
        public string Id { get; set; }

        public string MedVacName { get; set; }

        public string Type { get; set; }

        public int Quantity { get; set; }
        public string Manufacturer { get; set; }
        // mô tả
        public string Description { get; set; }
        public int DaysUsableAfterImport { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
    }
}