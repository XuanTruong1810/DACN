using Application.DTOs.FoodExport;
using Application.Interfaces;
using Application.Models.FoodExportModelView;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class FoodExportController(IFoodExportService foodExportService) : ControllerBase
    {
        private readonly IFoodExportService _foodExportService = foodExportService;
        [HttpGet]
        public async Task<IActionResult> GetAllFoodExport()
        {
            List<FoodExportModelView>? result = await _foodExportService.GetAllFoodExport();
            return Ok(BaseResponse<List<FoodExportModelView>>.OkResponse(result));
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodExportById(string id)
        {
            FoodExportModelView? result = await _foodExportService.GetFoodExportById(id);
            return Ok(BaseResponse<FoodExportModelView>.OkResponse(result));
        }
        [HttpPost]
        public async Task<IActionResult> CreateFoodExport([FromBody] CreateFoodExportDto model)
        {
            FoodExportModelView? result = await _foodExportService.CreateFoodExport(model);
            return Ok(BaseResponse<FoodExportModelView>.OkResponse(result));
        }
    }
}