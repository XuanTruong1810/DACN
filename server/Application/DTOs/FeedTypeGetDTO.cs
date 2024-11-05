namespace Application.DTOs
{
    public class FeedTypeGetDTO
    {
        public string? Name { get; set; }
        public string? Status { get; set; }


        public int? PageIndex { get; set; } = 1;
        public int? PageSize { get; set; } = 10;
    }
}