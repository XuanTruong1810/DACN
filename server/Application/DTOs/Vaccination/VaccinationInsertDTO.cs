using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Vaccination
{
    public class VaccinationInsertDTO
    {
        [Required]
        public DateTimeOffset ExaminationDate { get; set; } // ngày khám

        public string? ExaminationNote { get; set; } // ghi chú khám


        public string? ExaminationType { get; set; } = "Regular"; // loại khám


        public string? MedicineId { get; set; } // id thuốc

        public List<VaccinationInsertDetailDTO> VaccinationInsertDetails { get; set; }
    }

    public class VaccinationInsertDetailDTO
    {
        [Required]
        public string PigId { get; set; } // id số lợn

        public bool IsHealthy { get; set; } // trạng thái sức khỏe
        public string? Diagnosis { get; set; } // chuẩn đoán

        public string? TreatmentMethod { get; set; } // cách điều trị

        public string? VaccineName { get; set; } // tên vaccine

        public DateTimeOffset LastModifiedTime { get; set; } // thời gian khám lại

        public List<VaccinationInsertMedicationDetailDTO>? VaccinationInsertMedicationDetails { get; set; }
    }
    public class VaccinationInsertMedicationDetailDTO
    {
        public string? MedicineId { get; set; } // id thuốc

        public decimal? Quantity { get; set; } // số lượng dùng
    }
}