namespace Application.DTOs
{
    public class FeedGetDTO
    {
        public string? Search { get; set; }
        public string? FeedTypeId { get; set; }
        public string? AreasId { get; set; }
        public string? FeedQuantitySort { get; set; }
        public int PageSize { get; set; } = 10;
        public int PageIndex { get; set; } = 1;
    }
}