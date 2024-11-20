using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    // Thuốc
    public class Medicines : BaseEntity
    {
        public string MedicineName { get; set; }
        public string Description { get; set; }
        public string Usage { get; set; }             // Cách dùng
        public bool IsVaccine { get; set; }           // True nếu là vaccine

        public decimal QuantityInStock { get; set; } = 0;

        public string Unit { get; set; }

        // Các trường cho vaccine
        public int? DaysAfterImport { get; set; }      // Ngày sau khi nhập vào
        public bool IsActive { get; set; } = true;

        // Navigation properties


        public virtual ICollection<MedicineSupplier> MedicineSuppliers { get; set; }

        public virtual ICollection<VaccinationPlan> VaccinationPlans { get; set; }
    }
}