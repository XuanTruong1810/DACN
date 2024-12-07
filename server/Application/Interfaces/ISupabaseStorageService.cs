using Application.Models.Backup;
using Application.Services;

namespace Application.Interfaces;

public interface ISupabaseStorageService
{
    Task<string> UploadBackupAsync(string filePath);

    Task<List<BackupFileInfoModelView>> GetBackupFilesAsync();

    Task<string> DownloadFileAsync(string filePath);

    Task DeleteFileAsync(string filePath);
    Task<bool> FileExistsAsync(string filePath);
}