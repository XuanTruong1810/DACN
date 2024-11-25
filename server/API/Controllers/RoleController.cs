using Application.Interfaces;
using Application.Models.Role;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoleController(IRoleService roleService) : ControllerBase
{
    private readonly IRoleService _roleService = roleService;

    [HttpGet]
    [Authorize(Policy = "FullAccess")]
    public async Task<IActionResult> GetAllRoles()
    {
        List<RoleModelView>? roles = await _roleService.GetAllRoles();
        return Ok(BaseResponse<List<RoleModelView>>.OkResponse(roles));
    }
}