using Application.Interfaces;
using Core.Stores;
using Dropbox.Api;
using Dropbox.Api.Files;
using Dropbox.Api.Sharing;
using Dropbox.Api.Stone;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class DropboxService : IDropboxService
{
    private readonly DropboxClient _dropboxClient;

    private readonly string _backupFolder;
    private readonly ILogger<DropboxService> _logger;

    public DropboxService(IConfiguration configuration, ILogger<DropboxService> logger)
    {
        _logger = logger;
        string accessToken = configuration["Dropbox:AccessToken"];
        _dropboxClient = new DropboxClient(accessToken);
        _backupFolder = "/Backups";
    }

    public async Task<string> UploadBackupAsync(string filePath)
    {
        try
        {
            using FileStream? fileStream = File.OpenRead(filePath);
            string? fileName = Path.GetFileName(filePath);
            string? dropboxPath = $"{_backupFolder}/{fileName}";

            FileMetadata? uploadResult = await _dropboxClient.Files.UploadAsync(
                dropboxPath,
                WriteMode.Overwrite.Instance,
                body: fileStream);


            _logger.LogInformation("Backup uploaded to Dropbox: {Path}", dropboxPath);
            return dropboxPath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading backup to Dropbox");
            throw;
        }
    }

    public async Task<List<BackupFileInfo>> GetBackupFilesAsync()
    {
        try
        {
            ListFolderResult? result = await _dropboxClient.Files.ListFolderAsync(_backupFolder);
            List<BackupFileInfo>? backups = new List<BackupFileInfo>();

            foreach (Metadata item in result.Entries.Where(e => e.IsFile))
            {
                FileMetadata? metadata = item.AsFile;
                string downloadUrl;

                try
                {
                    // Thử lấy shared link hiện có
                    var listSharedLinksResult = await _dropboxClient.Sharing.ListSharedLinksAsync(
                        path: metadata.PathLower,
                        directOnly: true
                    );

                    if (listSharedLinksResult.Links.Any())
                    {
                        // Sử dụng shared link đã tồn tại
                        downloadUrl = listSharedLinksResult.Links[0].Url;
                    }
                    else
                    {
                        // Tạo shared link mới nếu chưa có
                        var sharedLink = await _dropboxClient.Sharing.CreateSharedLinkWithSettingsAsync(metadata.PathLower);
                        downloadUrl = sharedLink.Url;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error getting shared link for {Path}, skipping download URL", metadata.PathLower);
                    downloadUrl = string.Empty;
                }

                backups.Add(new BackupFileInfo
                {
                    FileName = metadata.Name,
                    CreatedAt = metadata.ServerModified,
                    Size = FormatFileSize((long)metadata.Size),
                    DownloadUrl = downloadUrl,
                    Path = metadata.PathDisplay
                });
            }

            return backups.OrderByDescending(b => b.CreatedAt).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting backup list from Dropbox");
            throw;
        }
    }

    private string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        int order = 0;
        double size = bytes;

        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }

        return $"{size:0.##} {sizes[order]}";
    }

    public async Task<string> DownloadFileAsync(string filePath)
    {
        try
        {
            string downloadFolder = Path.Combine(Environment.GetEnvironmentVariable("BackupPath") ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tìm thấy đường dẫn backup"), "Downloads");
            Directory.CreateDirectory(downloadFolder);

            string fileName = Path.GetFileName(filePath);
            string localFilePath = Path.Combine(downloadFolder, fileName);

            using IDownloadResponse<FileMetadata>? response = await _dropboxClient.Files.DownloadAsync(filePath);
            using FileStream? fileStream = File.Create(localFilePath);
            using Stream? content = await response.GetContentAsStreamAsync();
            await content.CopyToAsync(fileStream);

            _logger.LogInformation("File downloaded and ready for restore: {LocalPath}", localFilePath);
            return localFilePath; // Trả về đường dẫn file để service khác có thể sử dụng để restore
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from Dropbox: {Path}", filePath);
            throw;
        }
    }
}

public class BackupFileInfo
{
    public string FileName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Size { get; set; }
    public string DownloadUrl { get; set; }
    public string Path { get; set; }
}