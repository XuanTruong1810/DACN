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

    [HttpPost("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreatePigExport([FromBody] PigExportDTO dto)
    {
        PigExportViewModel? result = await _pigExportService.CreatePigExport(dto);
        return CreatedAtAction(nameof(GetPigExportById), new { id = result?.Id }, BaseResponse<PigExportViewModel>.OkResponse(result));
    }

    [HttpGet("export/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPigExportById(string id)
    {
        PigExportViewModel? result = await _pigExportService.GetPigExportById(id);
        return Ok(BaseResponse<PigExportViewModel>.OkResponse(result));
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPigExports()
    {
        List<PigExportViewModel>? result = await _pigExportService.GetAllPigExports();
        return Ok(BaseResponse<List<PigExportViewModel>>.OkResponse(result));
    }




}