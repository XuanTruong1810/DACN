using System.Text.Json.Serialization;

namespace Application.Models.Medicine
{
    public class MedicineModelView
    {
        public string Id { get; set; }
        public string MedicineName { get; set; }
        public string Description { get; set; }
        public string Usage { get; set; }
        public string Unit { get; set; }
        public decimal QuantityInStock { get; set; }
        public bool IsVaccine { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public int? DaysAfterImport { get; set; }
        public bool IsActive { get; set; }

        public int? QuantityRequired { get; set; } // Số lượng thuốc cần dùng cho 1 heo
        public List<SupplierModelView> Suppliers { get; set; }
    }
}