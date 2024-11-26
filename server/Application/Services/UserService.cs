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

namespace Application.Services
{
    public class UserService(UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    ICloudinaryService cloudinaryService) : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly IMapper _mapper = mapper;
        private readonly UserManager<ApplicationUser> _userManager = userManager;
        private readonly RoleManager<IdentityRole> _roleManager = roleManager;
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
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
            var users = await _userManager.Users
                .Where(u => u.DeleteTime == null)
                .ToListAsync();

            var userDTOs = new List<UserDTO>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
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
                    // Add other properties as needed
                });
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

        public async Task<UserDTO> CreateUserAsync(CreateUserDTO dto)
        {
            // Validate roles
            foreach (var role in dto.Roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Role '{role}' does not exist");
            }

            var user = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                FullName = dto.FullName,
                Avatar = dto.Avatar,
                DateOfBirth = dto.DateOfBirth,
                CreatedTime = DateTimeOffset.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, string.Join(", ", result.Errors.Select(e => e.Description)));

            // Add roles
            result = await _userManager.AddToRolesAsync(user, dto.Roles);
            if (!result.Succeeded)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Failed to assign roles");

            return await GetUserByIdAsync(user.Id);
        }

        public async Task<UserDTO> UpdateUserAsync(string id, UpdateUserDTO dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            if (!string.IsNullOrEmpty(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrEmpty(dto.FullName))
                user.FullName = dto.FullName;

            if (dto.Avatar != null)
                user.Avatar = dto.Avatar;

            if (dto.DateOfBirth.HasValue)
                user.DateOfBirth = dto.DateOfBirth.Value;

            user.UpdatedTime = DateTimeOffset.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, string.Join(", ", result.Errors.Select(e => e.Description)));

            // Update password if provided
            if (!string.IsNullOrEmpty(dto.NewPassword))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
                if (!result.Succeeded)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Failed to update password");
            }

            // Update roles if provided
            if (dto.Roles != null)
            {
                var existingRoles = await _userManager.GetRolesAsync(user);
                result = await _userManager.RemoveFromRolesAsync(user, existingRoles);
                if (!result.Succeeded)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Failed to remove existing roles");

                result = await _userManager.AddToRolesAsync(user, dto.Roles);
                if (!result.Succeeded)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Failed to assign new roles");
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

        public async Task<bool> ToggleUserStatusAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.DeleteTime != null)
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người dùng");

            if (user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow)
            {
                // Lock user
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
                return false;
            }
            else
            {
                // Unlock user
                await _userManager.SetLockoutEndDateAsync(user, null);
                return true;
            }
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


