using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackupController(IRestoreService restoreService, IDropboxService dropboxService) : ControllerBase
{
    private readonly IDropboxService _dropboxService = dropboxService;
    private readonly IRestoreService _restoreService = restoreService;

    [HttpPost("{filePath}/restore")]
    public async Task<IActionResult> RestoreDatabaseAsync(string? filePath)
    {
        await _restoreService.RestoreDatabaseAsync(filePath);
        return Ok(BaseResponse<object>.OkResponse("Khôi phục database thành công"));
    }
    [HttpGet]
    public async Task<IActionResult> GetBackupListAsync()
    {
        List<BackupFileInfo> backupFiles = await _dropboxService.GetBackupFilesAsync();
        return Ok(BaseResponse<List<BackupFileInfo>>.OkResponse(backupFiles));
    }
}
