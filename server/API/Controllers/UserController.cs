using Application.DTOs.Users;
using Application.Interfaces;
using Application.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserService userService) : ControllerBase
{
    private readonly IUserService _userService = userService;
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> Profile()
    {
        UserModelView? result = await _userService.Profile();
        return Ok(BaseResponse<UserModelView>.OkResponse(result));
    }
    [HttpPatch("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromForm] UserUpdateDTO userUpdateDTO)
    {
        UserModelView? result = await _userService.UpdateProfile(userUpdateDTO);
        return Ok(BaseResponse<UserModelView>.OkResponse(result));
    }
}