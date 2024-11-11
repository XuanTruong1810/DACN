using Application.DTOs.Food;
using Application.Interfaces;
using Application.Models.FoodModelView;
using Core.Base;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodController : ControllerBase
{
    private readonly IFoodService _foodService;
    public FoodController(IFoodService foodService)
    {
        _foodService = foodService;
    }
    [HttpGet]
    public async Task<IActionResult> GetAllFoods(string? search, string? supplierId, string? areaId, int? page, int? pageSize)
    {
        return Ok(BaseResponse<BasePagination<FoodModelView>>.OkResponse(await _foodService.GetAllFoods(search, supplierId, areaId, page, pageSize)));
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetFoodById(string id)
    {
        return Ok(BaseResponse<FoodModelView>.OkResponse(await _foodService.GetFoodById(id)));
    }
    [HttpPost]
    public async Task<IActionResult> CreateFood(CreateFoodDto createFoodDto)
    {
        FoodModelView? result = await _foodService.CreateFood(createFoodDto);
        return CreatedAtAction(nameof(GetFoodById), new { id = result.Id }, BaseResponse<FoodModelView>.CreatedResponse(result));
    }
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateFood(string id, UpdateFoodDto updateFoodDto)
    {
        return Ok(BaseResponse<FoodModelView>.OkResponse(await _foodService.UpdateFood(id, updateFoodDto)));
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFood(string id)
    {
        await _foodService.DeleteFood(id);
        return Ok(BaseResponse<string>.OkResponse("Xóa thức ăn thành công!"));
    }
}