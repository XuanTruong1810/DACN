using Application.DTOs;
using Application.DTOs.Auth;
using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        private readonly IAuthService authService = authService;
        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDTO model)
        {
            AuthModelViews? result = await authService.Login(model);
            return Ok(BaseResponse<AuthModelViews>.OkResponse(result));
        }
        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken(RefreshTokenDTO model)
        {
            AuthModelViews? result = await authService.RefreshToken(model);
            return Ok(BaseResponse<AuthModelViews>.OkResponse(result));
        }
        [HttpPatch("ResetPassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDTO model)
        {
            await authService.ResetPassword(model);
            return Ok(BaseResponse<string>.OkResponse("Đã đặt lại mật khẩu thành công!"));
        }
        [HttpPatch("Confirm_OTP_ResetPassword")]
        public async Task<IActionResult> ConfirmOTPResetPassword(ConfirmOTPDTO model)
        {
            await authService.VerifyOtp(model);
            return Ok(BaseResponse<string>.OkResponse("Xác nhận thay đổi mật khẩu thành công!"));
        }
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(EmailDTO model)
        {
            await authService.ForgotPassword(model);
            return Ok(BaseResponse<string>.OkResponse("Đã gửi email xác nhận yêu cầu thay đổi mật khẩu."));
        }
        [Authorize]
        [HttpPatch("Change_Password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDTO model)
        {
            await authService.ChangePassword(model);
            return Ok(BaseResponse<string>.OkResponse("Thay đổi mật khẩu thành công!"));
        }
    }
}