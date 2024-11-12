using Application.DTOs.FoodImportRequest;
using Application.Interfaces;
using Application.Models.FoodImportRequestModelView;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class FoodImportRequestController(IFoodImportRequestService foodImportRequestService) : ControllerBase
{
    private readonly IFoodImportRequestService _foodImportRequestService = foodImportRequestService;

    [HttpPost]
    public async Task<IActionResult> CreateRequestAsync(CreateFoodImportRequestDto dto)
    {
        FoodImportRequestModelView? result = await _foodImportRequestService.CreateRequestAsync(dto);
        return Ok(BaseResponse<FoodImportRequestModelView>.CreatedResponse(result));
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRequestByIdAsync(string id)
    {
        FoodImportRequestModelView? result = await _foodImportRequestService.GetRequestByIdAsync(id);
        return Ok(BaseResponse<FoodImportRequestModelView>.OkResponse(result));
    }
    [HttpGet]
    public async Task<IActionResult> GetRequestsAsync([FromQuery] string? search = null, [FromQuery] string? status = null, [FromQuery] DateTimeOffset? fromDate = null, [FromQuery] DateTimeOffset? toDate = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        BasePagination<FoodImportRequestModelView> result = await _foodImportRequestService.GetRequestsAsync(search, status, fromDate, toDate, pageNumber, pageSize);
        return Ok(BaseResponse<BasePagination<FoodImportRequestModelView>>.OkResponse(result));
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRequestAsync(string id, UpdateFoodImportRequestDto dto)
    {
        FoodImportRequestModelView? result = await _foodImportRequestService.UpdateRequestAsync(id, dto);
        return Ok(BaseResponse<FoodImportRequestModelView>.OkResponse(result));
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRequestAsync(string id)
    {
        await _foodImportRequestService.DeleteRequestAsync(id);
        return Ok(BaseResponse<object>.OkResponse("Xóa phiếu đề xuất thành công"));
    }
    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveRequestAsync(string id, ApproveFoodImportRequestDto dto)
    {
        FoodImportRequestModelView? result = await _foodImportRequestService.ApproveRequestAsync(id, dto);
        return Ok(BaseResponse<FoodImportRequestModelView>.OkResponse(result));
    }
}