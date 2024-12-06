namespace Application.Models
{

    public class AuthModelViews
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string TokenType { get; set; }
        public string AuthType { get; set; }
        public DateTime ExpiresIn { get; set; }
        public UserInfo User { get; set; }
    }

    public class UserInfo
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }

        public List<string> Roles { get; set; }

        public List<string> Permissions { get; set; }
    }
}