using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Users
{
    public class UserDTO
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string? Avatar { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTimeOffset DateOfBirth { get; set; }
        public List<string> Roles { get; set; }
        public DateTimeOffset? LockOutEnd { get; set; }
    }

    public class CreateUserDTO
    {
        [Required]
        public string UserName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public string FullName { get; set; }

        public string? Avatar { get; set; }

        [Required]
        public DateTimeOffset DateOfBirth { get; set; }

        [Required]
        public List<string> Roles { get; set; }
    }

    public class UpdateUserDTO
    {
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Avatar { get; set; }
        public DateTimeOffset? DateOfBirth { get; set; }
        public List<string>? Roles { get; set; }
        public string? NewPassword { get; set; }
    }
}