namespace Application.Models
{
    public class UserModelView
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsLocked { get; set; }

    }
}