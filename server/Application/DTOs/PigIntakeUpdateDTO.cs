using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class PigIntakeUpdateDTO
    {
        public DateTimeOffset DeliveryDate { get; set; }
        public int? ReceivedQuantity { get; set; }
        public int? AcceptedQuantity { get; set; }
    }
}