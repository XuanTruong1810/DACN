using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

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
        [EmailAddress]
        public string Email { get; set; }


        [Required]
        public string FullName { get; set; }
        [Required]

        public IFormFile Avatar { get; set; }

        [Phone]
        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public DateTimeOffset DateOfBirth { get; set; }

        [Required]
        public List<string> Roles { get; set; }
    }

    public class UpdateUserDTO
    {
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public IFormFile? Avatar { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTimeOffset? DateOfBirth { get; set; }
        public List<string>? Roles { get; set; }

    }
}