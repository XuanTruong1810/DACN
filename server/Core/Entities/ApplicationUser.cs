using Microsoft.AspNetCore.Identity;

namespace Core.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
        public DateTimeOffset? CreatedTime { get; set; }
        public DateTimeOffset? UpdatedTime { get; set; }
        public DateTimeOffset? DeleteTime { get; set; }
    }
}