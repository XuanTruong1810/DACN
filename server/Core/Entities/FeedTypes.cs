using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class FeedTypes : BaseEntity
    {
        public string FeedTypeName { get; set; }

        [InverseProperty("FeedTypes")]
        public virtual ICollection<Feeds> Feeds { get; set; } = new List<Feeds>();
    }
}