using Microsoft.AspNetCore.Http;

namespace Application.Interfaces;
public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file);
    Task<bool> DeleteImageAsync(string publicId);
}