using Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData
{
    public static class SeedDataAccount
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            UserManager<ApplicationUser> userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole { Name = "Admin" });
            }
            string emailAdmin = "Admin@gmail.com";
            string passwordAdmin = "Admin123.";
            string nameAdmin = "Admin";


            ApplicationUser? adminAccount = await userManager.FindByEmailAsync(emailAdmin);
            if (adminAccount is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    UserName = emailAdmin,
                    Email = emailAdmin,
                    EmailConfirmed = true,
                    Name = nameAdmin
                };
                await userManager.CreateAsync(newAccount, passwordAdmin);
                await userManager.AddToRoleAsync(newAccount, "Admin");
            }

            if (!await roleManager.RoleExistsAsync("Dispatch"))
            {
                await roleManager.CreateAsync(new IdentityRole { Name = "Dispatch" });
            }
            string emailMember = "Dispatch@gmail.com";
            string passwordMember = "Dispatch123*";
            string nameMem = "Dispatch 1";

            ApplicationUser? memberAccount = await userManager.FindByEmailAsync(emailMember);
            if (memberAccount is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    UserName = emailMember,

                    Email = emailMember,
                    EmailConfirmed = true,
                    Name = nameMem,
                };
                await userManager.CreateAsync(newAccount, passwordMember);
                await userManager.AddToRoleAsync(newAccount, "Dispatch");
            }



            if (!await roleManager.RoleExistsAsync("FeedManager"))
            {
                await roleManager.CreateAsync(new IdentityRole { Name = "FeedManager" });
            }
            string emailFeedManager = "FeedManage@gmail.com";
            string passwordFeedManager = "FeedManage123*";
            string NameFeedManager = "FeedManage 1";

            ApplicationUser? FeedManager = await userManager.FindByEmailAsync(emailFeedManager);
            if (FeedManager is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    UserName = emailFeedManager,
                    Email = emailFeedManager,
                    EmailConfirmed = true,
                    Name = NameFeedManager,
                };
                await userManager.CreateAsync(newAccount, passwordFeedManager);
                await userManager.AddToRoleAsync(newAccount, "FeedManager");
            }


            if (!await roleManager.RoleExistsAsync("Veterinarian"))
            {
                await roleManager.CreateAsync(new IdentityRole { Name = "Veterinarian" });
            }
            string emailVeterinarian = "Veterinarian@gmail.com";
            string passwordVeterinarian = "Veterinarian123.";
            string NameVeterinarian = "Veterinarian 1";

            ApplicationUser? Veterinarian = await userManager.FindByEmailAsync(emailVeterinarian);
            if (Veterinarian is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    UserName = emailVeterinarian,
                    Email = emailVeterinarian,
                    EmailConfirmed = true,
                    Name = NameVeterinarian,
                };
                await userManager.CreateAsync(newAccount, passwordVeterinarian);
                await userManager.AddToRoleAsync(newAccount, "Veterinarian");
            }

        }
    }
}
