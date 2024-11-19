using Application.DTOs.MovePig;
using Application.Interfaces;
using Application.Models.MovePig;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MovePigController : ControllerBase
{
    private readonly IMovePigService _movePigService;

    public MovePigController(IMovePigService movePigService)
    {
        _movePigService = movePigService;
    }
    [HttpPost]
    public async Task<IActionResult> CreateMovePig([FromBody] CreateMovePigDTO createMovePigDTO)
    {
        MovePigModelView? result = await _movePigService.CreateMovePig(createMovePigDTO);
        return Ok(BaseResponse<MovePigModelView>.OkResponse(result));
    }
    [HttpGet]
    public async Task<IActionResult> GetMovePigs([FromQuery] string? fromArea, [FromQuery] string? toArea, [FromQuery] string? status, [FromQuery] DateTime? moveDate, [FromQuery] int page, [FromQuery] int pageSize)
    {
        List<MovePigModelView>? result = await _movePigService.GetMovePigs(fromArea, toArea, status, moveDate, page, pageSize);
        return Ok(BaseResponse<List<MovePigModelView>>.OkResponse(result));
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovePigById([FromRoute] string id)
    {
        MovePigModelView? result = await _movePigService.GetMovePigById(id);
        return Ok(BaseResponse<MovePigModelView>.OkResponse(result));
    }
}
