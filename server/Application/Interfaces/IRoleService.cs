using Application.Models.Role;

namespace Application.Interfaces;
public interface IRoleService
{
    Task<List<RoleModelView>> GetAllRoles();
}
