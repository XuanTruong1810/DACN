using Microsoft.AspNetCore.Http;

namespace Application.DTOs.Users;

public class UserUpdateDTO
{
    public IFormFile? Avatar { get; set; }
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTimeOffset? DateOfBirth { get; set; }


}