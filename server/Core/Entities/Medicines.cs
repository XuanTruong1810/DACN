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

        // Các trường cho vaccine
        public int? DaysAfterImport { get; set; }      // Ngày sau khi nhập vào
        public int? NumberOfInjections { get; set; } // Số mũi tiêm
        public int? DaysBetweenInjections { get; set; } // Khoảng ngày giữa các mũi tiêm
        public bool IsActive { get; set; } = true;

        // Navigation properties

        public virtual ICollection<MedicineUnit> MedicineUnits { get; set; }

        public virtual ICollection<MedicineSupplier> MedicineSuppliers { get; set; }

        public virtual ICollection<VaccinationPlan> VaccinationPlans { get; set; }
    }
}