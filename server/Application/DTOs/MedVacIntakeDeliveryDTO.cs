namespace Application.DTOs
{


    public class MedVacDeliveryDTO
    {

        public DateTimeOffset DeliveryDate { get; set; }
        public List<MedVacDeliveryDetailDTO> MedVacDeliveryDetails { get; set; }

    }
    public class MedVacDeliveryDetailDTO
    {
        public string MedVacId { get; set; }
        public int ReceivedQuantity { get; set; }
        public int AcceptedQuantity { get; set; }
    }
}