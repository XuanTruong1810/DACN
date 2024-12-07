using System.Security.Claims;
using Application.DTOs.Auth;
using Application.DTOs.Users;
using Application.Models.User;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Application.Interfaces;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using System.Text.RegularExpressions;

namespace Application.Services
{
    public class UserService(UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    ICloudinaryService cloudinaryService,
    IEmailService emailService) : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly UserManager<ApplicationUser> _userManager = userManager;
        private readonly RoleManager<IdentityRole> _roleManager = roleManager;
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IEmailService _emailService = emailService;
        private readonly ICloudinaryService _cloudinaryService = cloudinaryService;

        public Task ChangePassword(ChangePasswordDTO changePasswordDTO)
        {
            throw new NotImplementedException();
        }

        public async Task<UserModelView> Profile()
        {
            string? userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            ApplicationUser? user = await _userManager
            .Users
            .Where(u => u.Id == userId)
            .AsNoTracking()
            .FirstOrDefaultAsync()
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            IList<string>? roles = await _userManager.GetRolesAsync(user);
            string? role = roles.FirstOrDefault();

            UserModelView? userModelView = new UserModelView
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = role,
                Avatar = user.Avatar,
                DateOfBirth = user.DateOfBirth,
                PhoneNumber = user.PhoneNumber,
                LockoutEnd = user.LockoutEnd

            };
            return userModelView;
        }

        public async Task<UserModelView> UpdateProfile(UserUpdateDTO userUpdateDTO)
        {

            string? userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Token không hợp lệ");

            ApplicationUser? user = await _userManager.FindByIdAsync(userId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            if (userUpdateDTO.FullName is not null)
                user.FullName = userUpdateDTO.FullName;

            if (userUpdateDTO.PhoneNumber is not null)
                user.PhoneNumber = userUpdateDTO.PhoneNumber;

            if (userUpdateDTO.DateOfBirth is not null)
                user.DateOfBirth = userUpdateDTO.DateOfBirth.GetValueOrDefault();

            if (userUpdateDTO.Avatar is not null)
            {
                string? imageUrl = await _cloudinaryService.UploadImageAsync(userUpdateDTO.Avatar);
                user.Avatar = imageUrl;
            }
            user.UpdatedTime = DateTimeOffset.UtcNow;
            IdentityResult? result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Cập nhật thông tin thất bại {string.Join(", ", result.Errors.Select(e => e.Description))}");
            return new UserModelView
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault(),
                Avatar = user.Avatar,
                DateOfBirth = user.DateOfBirth,
                PhoneNumber = user.PhoneNumber,
                LockoutEnd = user.LockoutEnd
            };
        }

        public async Task<List<UserDTO>> GetAllUsersAsync()
        {
            List<ApplicationUser>? users = await _userManager.Users
                .Where(u => u.DeleteTime == null)
                .ToListAsync();

            List<UserDTO>? userDTOs = new List<UserDTO>();
            foreach (ApplicationUser user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("Admin"))
                {
                    userDTOs.Add(new UserDTO
                    {
                        Id = user.Id,
                        UserName = user.UserName,
                        Email = user.Email,
                        FullName = user.FullName,
                        Avatar = user.Avatar,
                        DateOfBirth = user.DateOfBirth,
                        Roles = roles.ToList(),
                        PhoneNumber = user.PhoneNumber,
                        LockOutEnd = user.LockoutEnd
                    });
                }
            }

            return userDTOs;
        }
        public async Task<UserDTO> GetUserByIdAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            IList<string>? roles = await _userManager.GetRolesAsync(user);
            return new UserDTO
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                FullName = user.FullName,
                Avatar = user.Avatar,
                DateOfBirth = user.DateOfBirth,
                Roles = roles.ToList(),
                LockOutEnd = user.LockoutEnd
            };
        }


        private readonly Random random = new Random();

        private string GenerateRandomPassword(int length = 8)
        {
            const string upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
            const string numbers = "0123456789";
            const string specialChars = "@$!%*?&.";


            if (length < 8)
            {
                length = 8;
            }


            char[] passwordChars = new char[length];
            passwordChars[0] = upperCaseChars[random.Next(upperCaseChars.Length)];
            passwordChars[1] = lowerCaseChars[random.Next(lowerCaseChars.Length)];
            passwordChars[2] = numbers[random.Next(numbers.Length)];
            passwordChars[3] = specialChars[random.Next(specialChars.Length)];


            for (int i = 4; i < length; i++)
            {
                string allChars = upperCaseChars + lowerCaseChars + numbers + specialChars;
                passwordChars[i] = allChars[random.Next(allChars.Length)];
            }

            string password = new string(passwordChars.OrderBy(x => random.Next()).ToArray());


            if (!IsPasswordValid(password))
            {

                return GenerateRandomPassword(length);
            }

            return password;
        }

        private bool IsPasswordValid(string password)
        {
            Regex? regex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,16}$");
            return regex.IsMatch(password);
        }

        public async Task<UserDTO> CreateUserAsync(CreateUserDTO dto)
        {
            ApplicationUser? userExist = await _userManager.FindByEmailAsync(dto.Email);
            if (userExist != null)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Email đã tồn tại trong hệ thống");
            // Validate roles
            foreach (string role in dto.Roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Role '{role}' does not exist");
            }

            string? avatarUrl = null;
            if (dto.Avatar != null)
            {
                avatarUrl = await _cloudinaryService.UploadImageAsync(dto.Avatar);
            }



            // Get latest user ID
            ApplicationUser? latestUser = await _userManager.Users
                .OrderByDescending(u => u.Id)
                .FirstOrDefaultAsync();

            string newId;
            if (latestUser == null || !latestUser.Id.StartsWith("US"))
            {
                newId = "US00001";
            }
            else
            {
                int currentNumber = int.Parse(latestUser.Id.Substring(2));
                newId = $"US{(currentNumber + 1):D5}";
            }

            ApplicationUser? user = new ApplicationUser
            {
                Id = newId,
                UserName = dto.Email,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                FullName = dto.FullName,
                Avatar = avatarUrl,
                DateOfBirth = dto.DateOfBirth,
                CreatedTime = DateTimeOffset.UtcNow,
                EmailConfirmed = true
            };
            string? password = GenerateRandomPassword();

            IdentityResult? result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, string.Join(", ", result.Errors.Select(e => e.Description)));

            result = await _userManager.AddToRolesAsync(user, dto.Roles);
            if (!result.Succeeded)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Failed to assign roles");

            await _emailService.SendEmailAsync(
    user.Email,
    "Tạo tài khoản thành công",
    $"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://res.cloudinary.com/dxx6zq50z/image/upload/v1728261614/pig-management/logo_pig_management_zqzqzq.png" alt="Logo" style="max-width: 150px;">
                </div>
                
                <h2 style="color: #333333; margin-bottom: 20px; text-align: center;">Chào mừng bạn đến với Pig Management</h2>
                
                <p style="color: #666666; margin-bottom: 25px;">
                    Xin chào,<br>
                    Tài khoản của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập của bạn:
                </p>
                
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <p style="margin: 0; color: #333333;">
                        <strong style="color: #2d3748;">Email:</strong> 
                        <span style="color: #4a5568;">{user.Email}</span>
                    </p>
                    <p style="margin: 10px 0 0 0; color: #333333;">
                        <strong style="color: #2d3748;">Mật khẩu:</strong> 
                        <span style="color: #4a5568;">{password}</span>
                    </p>
                </div>
                
                <div style="background-color: #fff3cd; border-radius: 8px; padding: 15px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404;">
                        <strong>Lưu ý:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu tiên để đảm bảo an toàn cho tài khoản của bạn.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href= "{Environment.GetEnvironmentVariable("SERVER_DOMAIN")}/auth/login" 
                       style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">
                        Đăng nhập ngay
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #666666; margin: 0; font-size: 14px; text-align: center;">
                    Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email: truongtamcobra@gmail.com
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999999; font-size: 12px;">
                <p>© 2024 Pig Management. All rights reserved.</p>
                <p>Địa chỉ công ty: 227/13/10 Phạm Đăng Giảng - Bình Hưng Hòa - Bình Tân - TP.HCM</p>
            </div>
        </div>
    </body>
    </html>
    """);

            return await GetUserByIdAsync(user.Id);
        }

        public async Task<UserDTO> UpdateUserAsync(string id, UpdateUserDTO dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                user.UserName = dto.Email;
                user.Email = dto.Email;
            }

            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName;

            if (dto.PhoneNumber != null)
                user.PhoneNumber = dto.PhoneNumber;

            if (dto.DateOfBirth.HasValue)
                user.DateOfBirth = dto.DateOfBirth.Value;

            if (dto.Avatar != null)
            {
                string? imageUrl = await _cloudinaryService.UploadImageAsync(dto.Avatar);
                user.Avatar = imageUrl;
            }

            user.UpdatedTime = DateTimeOffset.UtcNow;

            IdentityResult? result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Cập nhật thông tin thất bại {string.Join(", ", result.Errors.Select(e => e.Description))}");

            // Update roles if provided
            if (dto.Roles != null && dto.Roles.Any())
            {
                IList<string>? existingRoles = await _userManager.GetRolesAsync(user);
                result = await _userManager.RemoveFromRolesAsync(user, existingRoles);
                if (!result.Succeeded)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Xóa vai trò hiện tại thất bại");

                result = await _userManager.AddToRolesAsync(user, dto.Roles);
                if (!result.Succeeded)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Thêm vai trò mới thất bại");
            }

            return await GetUserByIdAsync(user.Id);
        }

        public async Task DeleteUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            user.DeleteTime = DateTimeOffset.UtcNow;
            await _userManager.UpdateAsync(user);
        }

        public async Task LockUserAsync(string id)
        {
            ApplicationUser? user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            if (user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow)
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        }

        public async Task UnlockUserAsync(string id)
        {
            ApplicationUser? user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");


            await _userManager.SetLockoutEndDateAsync(user, null);
        }

        public async Task<List<string>> GetUserRolesAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            return (await _userManager.GetRolesAsync(user)).ToList();
        }

        public async Task<bool> UpdateUserRolesAsync(string id, List<string> roles)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            // Validate roles
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Role '{role}' does not exist");
            }

            var existingRoles = await _userManager.GetRolesAsync(user);
            var result = await _userManager.RemoveFromRolesAsync(user, existingRoles);
            if (!result.Succeeded)
                return false;

            result = await _userManager.AddToRolesAsync(user, roles);
            return result.Succeeded;
        }

    }
}


