namespace Application.Models
{
    public class FeedGetModel
    {
        public string FeedId { get; set; }

        public string FeedName { get; set; }


        public string Area { get; set; }

        public string FeedTypeName { get; set; }

        public decimal FeedPerPig { get; set; }

        public decimal FeedQuantity { get; set; }
    }
}