using System.Security.Claims;
using Application.Interfaces;
using Application.Models.Role;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RoleService(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<List<RoleModelView>> GetAllRoles()
        {
            List<IdentityRole>? roles = await _roleManager.Roles.ToListAsync();
            List<RoleModelView>? result = new List<RoleModelView>();

            foreach (IdentityRole role in roles)
            {
                IList<Claim>? claims = await _roleManager.GetClaimsAsync(role);
                List<string>? permissions = claims
                    .Where(c => c.Type == "Permission")
                    .Select(c => c.Value)
                    .ToList();

                result.Add(new RoleModelView
                {
                    Id = role.Id,
                    Name = role.Name,
                    Claims = permissions.Select(p => new ClaimModelView { Type = p }).ToList()
                });
            }
            return result;
        }
    }
}