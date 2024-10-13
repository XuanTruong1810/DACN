using Application.DTOs;
using Application.Models;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthModelViews> Login(LoginDTO loginModel);
        // Task<AuthResponse> RefreshToken(RefreshTokenModel refreshTokenModel);
        // Task VerifyOtp(ConfirmOTPModel model, bool isResetPassword);
        // Task ResendConfirmationEmail(EmailModelView emailModelView);
        // Task ChangePassword(ChangePasswordModel model);
        // Task ForgotPassword(EmailModelView emailModelView);
        // Task ResetPassword(ResetPasswordModel resetPassword);
    }
}