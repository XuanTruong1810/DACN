using Application.Services;

namespace Application.Interfaces;

public interface IDropboxService
{
    Task<string> UploadBackupAsync(string filePath);

    Task<List<BackupFileInfo>> GetBackupFilesAsync();

    Task<string> DownloadFileAsync(string filePath);
}
