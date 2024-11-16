

using Application.DTOs.Auth;
using Application.DTOs.Users;
using Application.Models.User;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<UserModelView> Profile();

        Task<UserModelView> UpdateProfile(UserUpdateDTO userUpdateDTO);

        Task ChangePassword(ChangePasswordDTO changePasswordDTO);
    }
}