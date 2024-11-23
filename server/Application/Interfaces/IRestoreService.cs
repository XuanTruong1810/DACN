namespace Application.Interfaces;

public interface IRestoreService
{
    Task RestoreDatabaseAsync(string? filePath);
}
