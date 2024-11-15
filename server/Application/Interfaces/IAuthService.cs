using Application.DTOs;
using Application.DTOs.Auth;
using Application.Models;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthModelViews> Login(LoginDTO loginModel);
        Task<AuthModelViews> RefreshToken(RefreshTokenDTO refreshTokenModel);
        Task VerifyOtp(ConfirmOTPDTO model);
        Task ChangePassword(ChangePasswordDTO model);
        Task ForgotPassword(EmailDTO emailModelView);
        Task ResetPassword(ResetPasswordDTO resetPassword);
    }
}