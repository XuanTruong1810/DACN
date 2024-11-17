using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Medicines
{
    public class InsertMedicineDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập tên thuốc")]
        public string MedicineName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mô tả")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập cách dùng")]
        public string? Usage { get; set; }

        public bool IsVaccine { get; set; } = false;

        public int? DaysAfterImport { get; set; }
        public int? NumberOfInjections { get; set; }
        public int? DaysBetweenInjections { get; set; }

        public bool IsActive { get; set; } = true;
    }
}