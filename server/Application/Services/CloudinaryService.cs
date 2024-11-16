using Application.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Application.Services;


public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;
    public CloudinaryService(IConfiguration configuration)
    {
        Account? account = new Account(
            configuration["Cloudinary:CloudName"],
            configuration["Cloudinary:ApiKey"],
            configuration["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                throw new BaseException(Core.Stores.StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "File không hợp lệ");

            using Stream? stream = file.OpenReadStream();
            ImageUploadParams? uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "farm/avatars",
                Transformation = new Transformation()
                    .Width(500)
                    .Height(500)
                    .Crop("fill")
                    .Gravity("face")
            };

            ImageUploadResult? uploadResult = await _cloudinary.UploadAsync(uploadParams);
            return uploadResult.SecureUrl.ToString();
        }
        catch (Exception ex)
        {
            throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                "Lỗi khi upload ảnh");
        }
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        try
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }
        catch (Exception ex)
        {
            throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                "Lỗi khi xóa ảnh");
        }
    }
}