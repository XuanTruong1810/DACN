using Application.Interfaces;
using Core.Stores;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using System.IO;

namespace Application.Services
{
    public class RestoreService(IDropboxService dropboxService, ILogger<RestoreService> logger) : IRestoreService
    {
        private readonly IDropboxService _dropboxService = dropboxService;

        private readonly ILogger<RestoreService> _logger = logger;

        public async Task RestoreDatabaseAsync(string? filePath)
        {
            try
            {
                string backupPath;
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    // Lấy file backup mới nhất từ Dropbox
                    List<BackupFileInfo>? backupFiles = await _dropboxService.GetBackupFilesAsync();
                    BackupFileInfo? latestBackup = backupFiles.OrderByDescending(f => f.CreatedAt).FirstOrDefault()
                        ?? throw new Exception("Không tìm thấy file backup nào");
                    backupPath = latestBackup.Path;
                }
                else
                {
                    backupPath = filePath;
                }

                // Tải file backup về local
                string localBackupPath = await _dropboxService.DownloadFileAsync(backupPath);

                // Thực hiện restore database
                using SqlConnection? connection = new SqlConnection(Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING"));
                await connection.OpenAsync();

                // Chuyển database sang chế độ single user
                string killSql = @"
                    ALTER DATABASE PigManagement 
                    SET SINGLE_USER 
                    WITH ROLLBACK IMMEDIATE;";
                await ExecuteSqlCommandAsync(connection, killSql);

                // Restore database
                string restoreSql = $@"
                    RESTORE DATABASE PigManagement
                    FROM DISK = N'{localBackupPath}'
                    WITH REPLACE;";
                await ExecuteSqlCommandAsync(connection, restoreSql);

                // Chuyển database về chế độ multi user
                string multiUserSql = @"
                    ALTER DATABASE PigManagement 
                    SET MULTI_USER;";
                await ExecuteSqlCommandAsync(connection, multiUserSql);

                // Xóa file backup tạm
                if (File.Exists(localBackupPath))
                {
                    File.Delete(localBackupPath);
                }

                _logger.LogInformation("Database restored successfully from {BackupPath}", backupPath);
            }
            catch (BaseException ex)
            {
                _logger.LogError(ex, "Failed to restore database");
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, ex.Message);
            }
        }

        private async Task ExecuteSqlCommandAsync(SqlConnection connection, string sql)
        {
            using var command = new SqlCommand(sql, connection);
            command.CommandTimeout = 300; // 5 phút
            await command.ExecuteNonQueryAsync();
        }
    }
}