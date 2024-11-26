using Application.DTOs.Users;
using Application.Interfaces;
using Application.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(BaseResponse<List<UserDTO>>.OkResponse(users));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        return Ok(BaseResponse<UserDTO>.OkResponse(user));
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserDTO dto)
    {
        var user = await _userService.CreateUserAsync(dto);
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, BaseResponse<UserDTO>.CreatedResponse(user));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, UpdateUserDTO dto)
    {
        var user = await _userService.UpdateUserAsync(id, dto);
        return Ok(BaseResponse<UserDTO>.OkResponse(user));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        await _userService.DeleteUserAsync(id);
        return NoContent();
    }

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(string id)
    {
        var result = await _userService.ToggleUserStatusAsync(id);
        return Ok(BaseResponse<bool>.OkResponse(result));
    }

    [HttpGet("{id}/roles")]
    public async Task<IActionResult> GetUserRoles(string id)
    {
        var roles = await _userService.GetUserRolesAsync(id);
        return Ok(BaseResponse<List<string>>.OkResponse(roles));
    }

    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateUserRoles(string id, [FromBody] List<string> roles)
    {
        var result = await _userService.UpdateUserRolesAsync(id, roles);
        return Ok(BaseResponse<bool>.OkResponse(result));
    }
}