namespace Application.DTOs
{
    public class FeedIntakeAcceptDTO
    {
        public string SuppliersId { get; set; }
        public decimal Deposit { get; set; }
        public List<FeedIntakeAcceptDetailDTO> FeedIntakeAcceptDetails { get; set; }
    }

    public class FeedIntakeAcceptDetailDTO
    {
        public string FeedId { get; set; }
        public decimal UnitPrice { get; set; }

    }
}