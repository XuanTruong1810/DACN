namespace Application.Models.User;

public class UserModelView
{
    public string Id { get; set; }
    public string Avatar { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string PhoneNumber { get; set; }
    public string Role { get; set; }
    public DateTimeOffset DateOfBirth { get; set; }

    public DateTimeOffset? LockoutEnd { get; set; }

}