using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class HealthRecordCreateDto
    {
        [Required(ErrorMessage = "Ngày ghi nhận không được để trống")]
        public DateTimeOffset RecordDate { get; set; }
        public List<HealthRecordDetailDTO> HealthRecordDetailDTO { get; set; }
    }
    public class HealthRecordDetailDTO
    {
        [Required(ErrorMessage = "Mã của vật nuôi không được để trống")]
        public string PigId { get; set; }

        public string? MedVacId { get; set; }
        [Required(ErrorMessage = "Trọng lượng không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Trọng lượng phải lớn hơn 0")]
        public double Weight { get; set; }
        [Required(ErrorMessage = "Trạng thái không được để trống")]
        public HealthRecordDetailStatus HealthStatus { get; set; }

        public string? Note { get; set; }

        public DateTimeOffset? NextCheckupDate { get; set; }
    }
    public enum HealthRecordDetailStatus
    {
        Good,
        Bad,
        Normal
    }
}