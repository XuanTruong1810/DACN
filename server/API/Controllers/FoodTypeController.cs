using Application.DTOs.FoodType;
using Application.Interfaces;
using Application.Models.FoodTypeModelView;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FoodTypeController(IFoodTypeService foodTypeService) : ControllerBase
    {
        private readonly IFoodTypeService _foodTypeService = foodTypeService;

        [HttpGet]
        public async Task<IActionResult> GetAllFoodTypes()
        {
            return Ok(BaseResponse<List<FoodTypeModelView>>.OkResponse(await _foodTypeService.GetAllFoodTypes()));
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodTypeById(string id)
        {
            return Ok(BaseResponse<FoodTypeModelView>.OkResponse(await _foodTypeService.GetFoodTypeById(id)));
        }
        [HttpPost]
        public async Task<IActionResult> CreateFoodType(CreateFoodTypeDto createFoodTypeDto)
        {
            FoodTypeModelView? foodType = await _foodTypeService.CreateFoodType(createFoodTypeDto);
            return CreatedAtAction(nameof(GetFoodTypeById), new { id = foodType.Id }, BaseResponse<FoodTypeModelView>.CreatedResponse(foodType));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFoodType(string id, UpdateFoodTypeDto updateFoodTypeDto)
        {
            FoodTypeModelView? foodType = await _foodTypeService.UpdateFoodType(id, updateFoodTypeDto);
            return Ok(BaseResponse<FoodTypeModelView>.OkResponse(foodType));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoodType(string id)
        {
            await _foodTypeService.DeleteFoodType(id);
            return Ok(BaseResponse<object>.OkResponse("Xóa loại thức ăn thành công!"));
        }
    }
}