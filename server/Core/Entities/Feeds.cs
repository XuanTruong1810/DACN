using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Feeds : BaseEntity
    {
        public string FeedName { get; set; }
        [ForeignKey("FeedTypes")]
        public string FeedTypeId { get; set; }

        public int FeedQuantity { get; set; } = 0;
        public virtual FeedTypes FeedTypes { get; set; }

        [ForeignKey("Areas")]
        public string AreasId { get; set; }
        public virtual Areas Areas { get; set; }
        public decimal FeedPerPig { get; set; }

    }
}