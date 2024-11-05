using System.Collections.Generic;

namespace Core.Entities
{
    // Thuốc
    public class Medicines : BaseEntity
    {
        public string MedicineName { get; set; }
        public string MedicineTypeId { get; set; }
        public string Description { get; set; }
        public string Usage { get; set; }             // Cách dùng
        public bool IsVaccine { get; set; }

        // Các trường cho vaccine
        public int? DaysAfterImport { get; set; }
        public int? NumberOfInjections { get; set; }
        public int? DaysBetweenInjections { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<MedicineUnit> MedicineUnits { get; set; }
        public virtual ICollection<MedicineSupplier> MedicineSuppliers { get; set; }
        public virtual ICollection<VaccinationSchedule> VaccinationSchedules { get; set; }
    }
}