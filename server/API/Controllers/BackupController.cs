using Application.Interfaces;
using Application.Models.Backup;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackupController(IRestoreService restoreService, ISupabaseStorageService supabaseStorageService) : ControllerBase
{
    private readonly ISupabaseStorageService _supabaseStorageService = supabaseStorageService;
    private readonly IRestoreService _restoreService = restoreService;

    [HttpPost("{filePath}/restore")]
    public async Task<IActionResult> RestoreDatabaseAsync(string? filePath)
    {
        await _restoreService.RestoreDatabaseAsync(filePath);
        return Ok(BaseResponse<object>.OkResponse("Khôi phục dữ liệu thành công"));
    }
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetBackupListAsync()
    {
        List<BackupFileInfoModelView> backupFiles = await _supabaseStorageService.GetBackupFilesAsync();
        return Ok(BaseResponse<List<BackupFileInfoModelView>>.OkResponse(backupFiles));
    }
}
