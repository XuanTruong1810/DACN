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
                IdentityRole? adminRole = new IdentityRole { Name = "Admin" };
                await roleManager.CreateAsync(adminRole);
                await roleManager.AddClaimAsync(adminRole, new System.Security.Claims.Claim("Permission", "FullAccess"));
            }
            string emailAdmin = "truongtamcobra@gmail.com";
            string passwordAdmin = "XuanTruong123.";
            string nameAdmin = "Nguyễn Xuân Trường";


            ApplicationUser? adminAccount = await userManager.FindByEmailAsync(emailAdmin);
            if (adminAccount is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    Id = "US00001",
                    UserName = emailAdmin,
                    PhoneNumber = "0971758902",
                    Email = emailAdmin,
                    EmailConfirmed = true,
                    FullName = nameAdmin,
                    DateOfBirth = new DateTime(2003, 10, 18),
                };
                await userManager.CreateAsync(newAccount, passwordAdmin);
                await userManager.AddToRoleAsync(newAccount, "Admin");
            }

            if (!await roleManager.RoleExistsAsync("Dispatch"))
            {
                IdentityRole? dispatchRole = new IdentityRole { Name = "Dispatch" };
                await roleManager.CreateAsync(dispatchRole);
                await roleManager.AddClaimAsync(dispatchRole, new System.Security.Claims.Claim("Permission", "ProposePigImport"));
                await roleManager.AddClaimAsync(dispatchRole, new System.Security.Claims.Claim("Permission", "AssignPigToPen"));
                await roleManager.AddClaimAsync(dispatchRole, new System.Security.Claims.Claim("Permission", "TransferPig"));
                await roleManager.AddClaimAsync(dispatchRole, new System.Security.Claims.Claim("Permission", "WeighPig"));

            }
            string emailMember = "nghianham125@gmail.com";
            string passwordMember = "TrungNghia123.";
            string nameMem = "Nhâm Trung Nghĩa";

            ApplicationUser? memberAccount = await userManager.FindByEmailAsync(emailMember);
            if (memberAccount is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    Id = "US00002",
                    UserName = emailMember,
                    PhoneNumber = "0903376314",
                    Email = emailMember,
                    EmailConfirmed = true,
                    FullName = nameMem,
                    DateOfBirth = new DateTime(2003, 04, 18),
                };
                await userManager.CreateAsync(newAccount, passwordMember);
                await userManager.AddToRoleAsync(newAccount, "Dispatch");
            }



            if (!await roleManager.RoleExistsAsync("FeedManager"))
            {
                var feedManagerRole = new IdentityRole { Name = "FeedManager" };
                await roleManager.CreateAsync(feedManagerRole);
                await roleManager.AddClaimAsync(feedManagerRole, new System.Security.Claims.Claim("Permission", "ProposeFeedImport"));
                await roleManager.AddClaimAsync(feedManagerRole, new System.Security.Claims.Claim("Permission", "ImportFeed"));
                await roleManager.AddClaimAsync(feedManagerRole, new System.Security.Claims.Claim("Permission", "ExportFeed"));
            }
            string emailFeedManager = "xuantruong18103@gmail.com";
            string passwordFeedManager = "XuanTruong123.";
            string NameFeedManager = "Nguyễn Xuân Trường";

            ApplicationUser? FeedManager = await userManager.FindByEmailAsync(emailFeedManager);
            if (FeedManager is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    Id = "US00003",
                    UserName = emailFeedManager,
                    Email = emailFeedManager,
                    PhoneNumber = "0971758902",
                    EmailConfirmed = true,
                    FullName = NameFeedManager,
                    DateOfBirth = new DateTime(2003, 10, 18),
                };
                await userManager.CreateAsync(newAccount, passwordFeedManager);
                await userManager.AddToRoleAsync(newAccount, "FeedManager");
            }


            if (!await roleManager.RoleExistsAsync("Veterinarian"))
            {
                IdentityRole? veterinarianRole = new IdentityRole { Name = "Veterinarian" };
                await roleManager.CreateAsync(veterinarianRole);
                await roleManager.AddClaimAsync(veterinarianRole, new System.Security.Claims.Claim("Permission", "MedicalExamination"));
                await roleManager.AddClaimAsync(veterinarianRole, new System.Security.Claims.Claim("Permission", "PeriodicInjection"));
                await roleManager.AddClaimAsync(veterinarianRole, new System.Security.Claims.Claim("Permission", "ProposeMedicineImport"));
                await roleManager.AddClaimAsync(veterinarianRole, new System.Security.Claims.Claim("Permission", "ProposePigExport"));
            }
            string emailVeterinarian = "tnan280103@gmail.com";
            string passwordVeterinarian = "Anhnhi123.";
            string NameVeterinarian = "Trần Nguyễn Ánh Nhi";

            ApplicationUser? Veterinarian = await userManager.FindByEmailAsync(emailVeterinarian);
            if (Veterinarian is null)
            {
                ApplicationUser? newAccount = new ApplicationUser
                {
                    Id = "US00004",
                    UserName = emailVeterinarian,
                    Email = emailVeterinarian,
                    PhoneNumber = "0396979034",
                    EmailConfirmed = true,
                    FullName = NameVeterinarian,
                    DateOfBirth = new DateTime(2003, 01, 28),
                };
                await userManager.CreateAsync(newAccount, passwordVeterinarian);
                await userManager.AddToRoleAsync(newAccount, "Veterinarian");
            }

        }
    }
}
