using Application.DTOs.FoodImport;
using Application.Interfaces;
using Application.Models.FoodImportModelView;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FoodImportController(IFoodImportService foodImportService) : ControllerBase
{
    private readonly IFoodImportService _foodImportService = foodImportService;

    /// <summary>
    /// Lấy danh sách phiếu nhập có phân trang và tìm kiếm
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetImports(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? supplierId,
        [FromQuery] string? requestId,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        BasePagination<FoodImportModelView>? result = await _foodImportService.GetImportsAsync(
            search, status, supplierId, requestId,
            fromDate, toDate, pageNumber, pageSize);
        return Ok(BaseResponse<BasePagination<FoodImportModelView>>.OkResponse(result));
    }

    /// <summary>
    /// Lấy chi tiết một phiếu nhập
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetImportById(string id)
    {
        FoodImportModelView? data = await _foodImportService.GetImportByIdAsync(id);
        return Ok(BaseResponse<FoodImportModelView>.OkResponse(data));
    }

    /// <summary>
    /// Tạo phiếu nhập mới từ phiếu đề xuất
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateImport(string requestId, [FromBody] List<CreateFoodImportDto> dto)
    {
        await _foodImportService.CreateImportsAsync(requestId, dto);
        return Ok(BaseResponse<string>.OkResponse("Xét duyệt thành công!"));
    }

    /// <summary>
    /// Cập nhật trạng thái giao hàng của phiếu nhập
    /// </summary>
    [HttpPut("{id}/delivery")]
    [Authorize(Roles = "Admin,Manager,Warehouse")]
    public async Task<IActionResult> UpdateDeliveryStatus(
        string id,
        [FromBody] UpdateDeliveryDto dto)
    {
        FoodImportModelView? data = await _foodImportService.UpdateDeliveryStatusAsync(id, dto);
        return Ok(BaseResponse<FoodImportModelView>.OkResponse(data));
    }
}