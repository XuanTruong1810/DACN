namespace Application.Models.Backup;

public class BackupFileInfoModelView
{
    public string FileName { get; set; }
    public DateTime CreatedAt { get; set; }
    public long Size { get; set; }
}
