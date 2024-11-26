using Core.Entities;
using Core.Stores;
using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Identity;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Application.DTOs.Auth;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;


namespace Application.Services
{

    public class AuthService(UserManager<ApplicationUser> userManager,
     SignInManager<ApplicationUser> signInManager, RoleManager<IdentityRole> roleManager,
      IMemoryCache memoryCache, IEmailService emailService, IHttpContextAccessor httpContextAccessor) : IAuthService
    {
        private readonly UserManager<ApplicationUser> userManager = userManager;
        private readonly SignInManager<ApplicationUser> signInManager = signInManager;
        private readonly RoleManager<IdentityRole> roleManager = roleManager;
        private readonly IMemoryCache memoryCache = memoryCache;
        private readonly IEmailService emailService = emailService;
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;


        private async Task<ApplicationUser> CheckRefreshToken(string refreshToken)
        {

            List<ApplicationUser>? users = await userManager.Users.ToListAsync();
            foreach (ApplicationUser user in users)
            {
                string? storedToken = await userManager.GetAuthenticationTokenAsync(user, "Default", "RefreshToken");

                if (storedToken == refreshToken)
                {
                    return user;
                }
            }
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Token không hợp lệ");
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user, List<string> roles)
        {
            List<Claim>? claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim("userId", user.Id),
                new Claim(ClaimTypes.Email, user.Email)
            };

            // Add role claims
            foreach (string role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));

                // Get permissions for each role
                IdentityRole? roleObj = await roleManager.FindByNameAsync(role);
                if (roleObj != null)
                {
                    IList<Claim>? roleClaims = await roleManager.GetClaimsAsync(roleObj);
                    foreach (Claim claim in roleClaims)
                    {
                        claims.Add(claim);
                    }
                }
            }

            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY")));
            SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken? token = new JwtSecurityToken(
                issuer: Environment.GetEnvironmentVariable("JWT_ISSUER"),
                audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        private async Task<string> GenerateRefreshToken(ApplicationUser user)
        {
            string? refreshToken = Guid.NewGuid().ToString();

            string? initToken = await userManager.GetAuthenticationTokenAsync(user, "Default", "RefreshToken");
            if (initToken != null)
            {

                await userManager.RemoveAuthenticationTokenAsync(user, "Default", "RefreshToken");

            }

            await userManager.SetAuthenticationTokenAsync(user, "Default", "RefreshToken", refreshToken);
            return refreshToken;
        }
        public async Task<AuthModelViews> Login(LoginDTO loginModel)
        {
            ApplicationUser? user = await userManager.FindByEmailAsync(loginModel.Email)
         ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy user");
            if (user.DeleteTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tài khoản đã bị xóa");
            }
            if (!await userManager.IsEmailConfirmedAsync(user))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tài khoản chưa được xác nhận");
            }
            SignInResult result = await signInManager.PasswordSignInAsync(loginModel.Email, loginModel.Password, false, false);
            if (!result.Succeeded)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Mật khẩu không đúng");
            }
            IList<string> roles = await userManager.GetRolesAsync(user);

            // Lấy permissions từ tất cả các roles
            var permissions = new List<string>();
            foreach (var role in roles)
            {
                var roleObj = await roleManager.FindByNameAsync(role);
                if (roleObj != null)
                {
                    var roleClaims = await roleManager.GetClaimsAsync(roleObj);
                    permissions.AddRange(roleClaims
                        .Where(c => c.Type == "Permission")
                        .Select(c => c.Value));
                }
            }

            string token = await GenerateJwtToken(user, roles.ToList());
            string refreshToken = await GenerateRefreshToken(user);

            return new AuthModelViews
            {
                AccessToken = token,
                RefreshToken = refreshToken,
                TokenType = "JWT",
                AuthType = "Bearer",
                ExpiresIn = DateTime.UtcNow.AddHours(1),
                User = new UserInfo
                {
                    Email = user.Email,
                    Roles = roles.ToList(),
                    Permissions = permissions.Distinct().ToList()  // Loại bỏ các permission trùng lặp
                }
            };
        }

        public async Task<AuthModelViews> RefreshToken(RefreshTokenDTO refreshTokenModel)
        {
            ApplicationUser? user = await CheckRefreshToken(refreshTokenModel.RefreshToken);
            IList<string> roles = await userManager.GetRolesAsync(user);
            string token = await GenerateJwtToken(user, roles.ToList());
            string refreshToken = await GenerateRefreshToken(user);
            return new AuthModelViews
            {
                AccessToken = token,
                RefreshToken = refreshToken,
                TokenType = "JWT",
                AuthType = "Bearer",
                ExpiresIn = DateTime.UtcNow.AddHours(1),
                User = new UserInfo
                {
                    Email = user.Email,
                    Roles = roles.ToList()
                }
            };
        }

        public async Task VerifyOtp(ConfirmOTPDTO model)
        {
            string cacheKey = $"OTPResetPassword_{model.Email}";
            if (memoryCache.TryGetValue(cacheKey, out string storedOtp))
            {
                if (storedOtp == model.OTP)
                {

                    ApplicationUser? user = await userManager.FindByEmailAsync(model.Email);


                    string? token = await userManager.GenerateEmailConfirmationTokenAsync(user);
                    await userManager.ConfirmEmailAsync(user, token);

                    memoryCache.Remove(cacheKey);
                }
                else
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "OTP không hợp lệ");
                }
            }
            else
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "OTP không hợp lệ hoặc đã hết hạn");
            }
        }

        public async Task ChangePassword(ChangePasswordDTO model)
        {
            string? userId = httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Token không hợp lệ");
            ApplicationUser? admin = await userManager.FindByIdAsync(userId) ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy user");
            if (admin.DeleteTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tài khoản đã bị xóa");
            }
            else
            {
                IdentityResult result = await userManager.ChangePasswordAsync(admin, model.Password, model.NewPassword);
                if (!result.Succeeded)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Đổi mật khẩu thất bại");
                }
            }
        }

        public async Task ForgotPassword(EmailDTO emailModelView)
        {
            ApplicationUser? user = await userManager.FindByEmailAsync(emailModelView.Email)
        ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Vui lòng kiểm tra email của bạn");
            if (!await userManager.IsEmailConfirmedAsync(user))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Vui lòng kiểm tra email của bạn");
            }
            string OTP = GenerateOtp();
            string cacheKey = $"OTPResetPassword_{emailModelView.Email}";
            memoryCache.Set(cacheKey, OTP, TimeSpan.FromMinutes(1));
            await emailService.SendEmailAsync(emailModelView.Email, "Đặt lại mật khẩu",
                       $"Vui lòng xác nhận tài khoản của bạn, OTP của bạn là:  <div class='otp'>{OTP}</div>");
        }

        public async Task ResetPassword(ResetPasswordDTO resetPassword)
        {
            ApplicationUser? user = await userManager.FindByEmailAsync(resetPassword.Email)
         ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy user");
            if (!await userManager.IsEmailConfirmedAsync(user))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Vui lòng kiểm tra email của bạn");
            }
            string? token = await userManager.GeneratePasswordResetTokenAsync(user);
            IdentityResult? result = await userManager.ResetPasswordAsync(user, token, resetPassword.Password);
            if (!result.Succeeded)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, result.Errors.FirstOrDefault()?.Description);
            }
        }
        private string GenerateOtp()
        {
            Random random = new Random();
            string otp = random.Next(100000, 999999).ToString();
            return otp;
        }
    }

}