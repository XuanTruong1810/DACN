namespace Application.DTOs
{
    public class FeedGetDTO
    {
        public string? FeedId { get; set; }

        public string? FeedName { get; set; }

        public string? FeedTypeId { get; set; }
        public string? AreasId { get; set; }
        public string? FeedQuantitySort { get; set; } = "asc";

        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;


    }
}