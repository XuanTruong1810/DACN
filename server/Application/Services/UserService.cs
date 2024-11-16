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
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    ICloudinaryService cloudinaryService) : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly IMapper _mapper = mapper;
        private readonly UserManager<ApplicationUser> _userManager = userManager;
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

    }
}


