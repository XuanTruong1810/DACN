using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CreateMedicineRequestDTO
    {
        public string Note { get; set; }
        public List<MedicineRequestDetailDTO> Details { get; set; }
    }

    public class MedicineRequestDetailDTO
    {
        [Required]
        public string MedicineId { get; set; }
        [Required]
        [Range(0.1, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public decimal Quantity { get; set; }
        public string Note { get; set; }
    }
}