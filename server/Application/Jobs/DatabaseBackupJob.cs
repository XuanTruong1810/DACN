using Application.Interfaces;
using Core.Stores;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Quartz;

namespace Application.Jobs;

public class DatabaseBackupJob : IJob
{
    private readonly string _connectionString;
    private readonly string _databaseName;
    private readonly ILogger<DatabaseBackupJob> _logger;
    private readonly ISupabaseStorageService _supabaseStorageService;

    public DatabaseBackupJob(
        ILogger<DatabaseBackupJob> logger,
        ISupabaseStorageService supabaseStorageService)
    {
        _logger = logger;
        _supabaseStorageService = supabaseStorageService;
        _connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tìm thấy connection string");
        _databaseName = "PigManagement";
    }

    public async Task Execute(IJobExecutionContext context)
    {
        string tempPath = string.Empty;
        try
        {
            _logger.LogInformation("Bắt đầu backup database lúc: {time}", DateTime.Now);

            // 1. Tạo file backup tạm trên local
            string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string backupFileName = $"{_databaseName}_backup_{timestamp}.bak";
            tempPath = Path.Combine(Environment.GetEnvironmentVariable("BACKUP_FOLDER") ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tìm thấy đường dẫn backup"), backupFileName);

            // 2. Backup database ra file local
            using (SqlConnection? connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using SqlCommand? command = new SqlCommand
                {
                    Connection = connection,
                    CommandText = $@"BACKUP DATABASE [{_databaseName}] 
                                   TO DISK = @backupPath 
                                   WITH FORMAT, 
                                   STATS = 10",
                    CommandTimeout = 3600
                };
                command.Parameters.AddWithValue("@backupPath", tempPath);
                await command.ExecuteNonQueryAsync();
            }

            _logger.LogInformation("Đã tạo file backup local: {path}", tempPath);

            // 3. Upload file local lên Dropbox
            string dropboxUrl = await _supabaseStorageService.UploadBackupAsync(tempPath);
            _logger.LogInformation("Đã upload lên Dropbox: {url}", dropboxUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi trong quá trình backup database");
            throw;
        }
        finally
        {
            // 4. Xóa file local sau khi đã upload xong
            if (File.Exists(tempPath))
            {
                File.Delete(tempPath);
                _logger.LogInformation("Đã xóa file backup local: {path}", tempPath);
            }
        }
    }
}
