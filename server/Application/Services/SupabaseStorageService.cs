using Application.Interfaces;
using Application.Models.Backup;
using Supabase.Storage;

public class SupabaseStorageService : ISupabaseStorageService
{
    private readonly Supabase.Client _supabaseClient;
    private const string BUCKET_NAME = "backups";

    public SupabaseStorageService(Supabase.Client supabaseClient)
    {
        _supabaseClient = supabaseClient ?? throw new ArgumentNullException(nameof(supabaseClient));
    }

    private async Task EnsureBucketExistsAsync()
    {
        Bucket? bucket = await _supabaseClient.Storage.GetBucket(BUCKET_NAME);
        if (bucket == null)
        {
            await _supabaseClient.Storage.CreateBucket(BUCKET_NAME, new BucketUpsertOptions
            {
                Public = false
            });
        }
    }

    public async Task<string> UploadBackupAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            throw new ArgumentNullException(nameof(filePath));

        await EnsureBucketExistsAsync();

        byte[] fileBytes = await File.ReadAllBytesAsync(filePath);
        string fileName = Path.GetFileName(filePath);

        await _supabaseClient.Storage
            .From(BUCKET_NAME)
            .Upload(fileBytes, fileName);

        return fileName;
    }

    public async Task<List<BackupFileInfoModelView>> GetBackupFilesAsync()
    {
        List<FileObject>? files = await _supabaseClient.Storage
            .From(BUCKET_NAME)
            .List();

        return files.Select(f => new BackupFileInfoModelView
        {
            FileName = f.Name,
            CreatedAt = f.CreatedAt ?? DateTime.MinValue,
            Size = f.MetaData["size"] as long? ?? 0
        }).ToList();
    }

    public async Task<string> DownloadFileAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            throw new ArgumentNullException(nameof(filePath));

        byte[]? bytes = await _supabaseClient.Storage
            .From(BUCKET_NAME)
            .Download(filePath, (TransformOptions?)null);

        var tempPath = Path.GetTempFileName();
        await File.WriteAllBytesAsync(tempPath, bytes);
        return tempPath;
    }

    public async Task DeleteFileAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            throw new ArgumentNullException(nameof(filePath));

        await _supabaseClient.Storage
            .From(BUCKET_NAME)
            .Remove(new List<string> { filePath });
    }

    public async Task<bool> FileExistsAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            throw new ArgumentNullException(nameof(filePath));

        try
        {
            var files = await _supabaseClient.Storage
                .From(BUCKET_NAME)
                .List(filePath);
            return files.Any();
        }
        catch
        {
            return false;
        }
    }
}
