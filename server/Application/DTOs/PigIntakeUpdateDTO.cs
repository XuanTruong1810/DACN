using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class PigIntakeUpdateDTO
    {
        public decimal? TotalPrice { get; set; }
        public int? ExpectedQuantity { get; set; }
        public int? ReceivedQuantity { get; set; }
        public int? AcceptedQuantity { get; set; }
        public int? RejectedQuantity { get; set; }
    }
}