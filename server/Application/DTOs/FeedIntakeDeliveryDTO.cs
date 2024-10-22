namespace Application.DTOs
{


    public class FeedIntakeDeliveryDTO
    {

        public DateTimeOffset DeliveryDate { get; set; }
        public List<FeedIntakeDeliveryDetailDTO> FeedIntakeDeliveryDetails { get; set; }

    }
    public class FeedIntakeDeliveryDetailDTO
    {
        public string FeedId { get; set; }
        public decimal ReceivedQuantity { get; set; }
        public decimal AcceptedQuantity { get; set; }
    }
}