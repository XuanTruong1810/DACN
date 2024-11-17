using Application.DTOs.ExportPig;
using Application.Interfaces;
using Application.Models.PigExport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PigExportController(IPigExportService pigExportService) : ControllerBase
{
    private readonly IPigExportService _pigExportService = pigExportService;
    [HttpPost("request")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<IActionResult> CreatePigExportRequest([FromBody] CreatePigExportRequestDTO dto)
    {
        PigExportRequestModelView? result = await _pigExportService.CreatePigExportRequest(dto);
        return CreatedAtAction(nameof(GetPigExportRequestById), new { id = result?.Id }, BaseResponse<PigExportRequestModelView>.OkResponse(result));
    }

    [HttpGet("request/{id}")]
    [Authorize(Roles = "Admin,Dispatcher")]

    public async Task<IActionResult> GetPigExportRequestById(string id)
    {
        PigExportRequestModelView? result = await _pigExportService.GetPigExportRequestById(id);
        return Ok(BaseResponse<PigExportRequestModelView>.OkResponse(result));
    }

    [HttpGet("request")]
    [Authorize(Roles = "Admin,Dispatcher")]

    public async Task<IActionResult> GetAllPigExportRequests()
    {
        List<PigExportRequestModelView>? result = await _pigExportService.GetAllPigExportRequests();
        return Ok(BaseResponse<List<PigExportRequestModelView>>.OkResponse(result));
    }

    [HttpPatch("request/{id}/approve")]
    [Authorize(Roles = "Admin,Dispatcher")]
    public async Task<IActionResult> ApprovePigExportRequest(string id)
    {
        PigExportRequestModelView? result = await _pigExportService.ApprovePigExportRequest(id);
        return Ok(BaseResponse<PigExportRequestModelView>.OkResponse(result));
    }
}