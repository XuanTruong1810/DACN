using Microsoft.AspNetCore.Identity;

namespace Core.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
        public string? Avatar { get; set; } = null;
        public DateTimeOffset DateOfBirth { get; set; }

        public DateTimeOffset? CreatedTime { get; set; }
        public DateTimeOffset? UpdatedTime { get; set; }
        public DateTimeOffset? DeleteTime { get; set; }
    }
}