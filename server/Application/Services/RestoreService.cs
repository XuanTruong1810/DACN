using Application.Interfaces;
using Application.Models.Backup;
using Core.Stores;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using System.IO;

namespace Application.Services
{
    public class RestoreService(ISupabaseStorageService supabaseStorageService, ILogger<RestoreService> logger) : IRestoreService
    {
        private readonly ISupabaseStorageService _supabaseStorageService = supabaseStorageService;

        private readonly ILogger<RestoreService> _logger = logger;

        private static readonly string BACKUP_FOLDER = Environment.GetEnvironmentVariable("BACKUP_FOLDER") ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tìm thấy biến môi trường BACKUP_FOLDER");

        public async Task RestoreDatabaseAsync(string? filePath)
        {
            try
            {
                // Tạo thư mục nếu chưa tồn tại
                if (!Directory.Exists(BACKUP_FOLDER))
                {
                    Directory.CreateDirectory(BACKUP_FOLDER);
                }

                string backupPath;
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    List<BackupFileInfoModelView>? backupFiles = await _supabaseStorageService.GetBackupFilesAsync();
                    BackupFileInfoModelView? latestBackup = backupFiles.OrderByDescending(f => f.CreatedAt).FirstOrDefault()
                        ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tìm thấy file backup nào");
                    backupPath = latestBackup.FileName;
                }
                else
                {
                    backupPath = filePath;
                }

                // Tải file về thư mục cố định
                string localBackupPath = Path.Combine(BACKUP_FOLDER, $"restore_{DateTime.Now:yyyyMMddHHmmss}.bak");
                string downloadedFile = await _supabaseStorageService.DownloadFileAsync(backupPath)
                    ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tải file backup về");

                // Copy file từ temp folder sang backup folder
                File.Copy(downloadedFile, localBackupPath, true);
                File.Delete(downloadedFile); // Xóa file t�m

                var builder = new SqlConnectionStringBuilder(Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING"));
                builder.InitialCatalog = "master";

                using SqlConnection connection = new SqlConnection(builder.ConnectionString);
                await connection.OpenAsync();

                // Kill tất cả các kết nối
                string killConnectionsSql = @"
                    USE master;
                    DECLARE @kill varchar(8000) = '';  
                    SELECT @kill = @kill + 'kill ' + CONVERT(varchar(5), session_id) + ';'  
                    FROM sys.dm_exec_sessions
                    WHERE database_id = db_id('PigManagement')
                    EXEC(@kill);";
                await ExecuteSqlCommandAsync(connection, killConnectionsSql);

                // Restore database
                string restoreSql = $@"
                    RESTORE DATABASE PigManagement
                    FROM DISK = N'{localBackupPath}'
                    WITH REPLACE;";
                await ExecuteSqlCommandAsync(connection, restoreSql);

                // Cleanup
                if (File.Exists(localBackupPath))
                {
                    File.Delete(localBackupPath);
                }

                _logger.LogInformation("Database restored successfully from {BackupPath}", backupPath);
            }
            catch (Exception ex)
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