namespace Application.Models
{
    public class FeedTypeGetModel
    {
        public string Id { get; set; }
        public string FeedTypeName { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int TotalProducts { get; set; }
        public DateTimeOffset CreatedTime { get; set; }
        public DateTimeOffset UpdatedTime { get; set; }
    }
}