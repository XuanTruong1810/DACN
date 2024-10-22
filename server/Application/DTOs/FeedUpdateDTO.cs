namespace Application.DTOs
{
    public class FeedUpdateDTO
    {
        public string? FeedName { get; set; }
        public string? FeedTypeId { get; set; }
        public decimal? FeedPerPig { get; set; }
        public string? AreasId { get; set; }

        public decimal? FeedQuantity { get; set; }
    }
}