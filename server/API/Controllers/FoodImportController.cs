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
    public async Task<IActionResult> GetImports()
    {
        List<FoodImportModelView>? result = await _foodImportService.GetImportsAsync();
        return Ok(BaseResponse<List<FoodImportModelView>>.OkResponse(result));
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
    public async Task<IActionResult> UpdateDeliveryStatus(string id, [FromBody] UpdateDeliveryDto dto)
    {
        FoodImportModelView? data = await _foodImportService.UpdateDeliveryStatusAsync(id, dto);
        return Ok(BaseResponse<FoodImportModelView>.OkResponse(data));
    }

    /// <summary>
    /// Cập nhật trạng thái kho
    /// </summary>
    [HttpPut("{id}/stock")]
    [Authorize(Roles = "Admin,Manager,Warehouse")]
    public async Task<IActionResult> UpdateStockStatus(string id)
    {
        FoodImportModelView? data = await _foodImportService.UpdateStockStatusAsync(id);
        return Ok(BaseResponse<FoodImportModelView>.OkResponse(data));
    }
}