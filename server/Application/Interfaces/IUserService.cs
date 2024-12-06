using Application.DTOs.Auth;
using Application.DTOs.Users;
using Application.Models.User;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDTO>> GetAllUsersAsync();
        Task<UserDTO> GetUserByIdAsync(string id);
        Task<UserDTO> CreateUserAsync(CreateUserDTO dto);
        Task<UserDTO> UpdateUserAsync(string id, UpdateUserDTO dto);
        Task DeleteUserAsync(string id);
        Task LockUserAsync(string id);
        Task UnlockUserAsync(string id);
        Task<List<string>> GetUserRolesAsync(string id);
        Task<bool> UpdateUserRolesAsync(string id, List<string> roles);
    }
}