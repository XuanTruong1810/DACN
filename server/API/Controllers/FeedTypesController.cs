using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class FeedTypesController(IFeedTypeService feedTypeService) : ControllerBase
    {
        private readonly IFeedTypeService feedTypeService = feedTypeService;
        [HttpGet]
        [Authorize(Roles = "Admin,FeedManager")]
        public async Task<IActionResult> Get([FromQuery] FeedTypeGetDTO dto)
        {
            BasePagination<FeedTypeGetModel>? feedType = await feedTypeService.GetFeedTypeService(dto);
            return Ok(BaseResponse<BasePagination<FeedTypeGetModel>>.OkResponse(feedType));
        }
        [HttpPost]
        [Authorize(Roles = "Admin,FeedManager")]

        public async Task<IActionResult> Post([FromBody] FeedTypeNonQueryDTO dto)
        {
            await feedTypeService.InsertFeedTypeService(dto);
            return Ok(BaseResponse<object>.OkResponse("Thêm loại thức ăn thành công"));
        }
        [HttpPatch]
        [Authorize(Roles = "Admin,FeedManager")]
        public async Task<IActionResult> Patch([FromQuery] string id, [FromBody] FeedTypeNonQueryDTO dto)
        {
            await feedTypeService.UpdateFeedTypeService(id, dto);
            return Ok(BaseResponse<object>.OkResponse("Cập nhật thành công"));
        }
        [HttpDelete]
        [Authorize(Roles = "Admin,FeedManager")]
        public async Task<IActionResult> Delete([FromQuery] string id)
        {
            await feedTypeService.DeleteFeedTypeService(id);
            return Ok(BaseResponse<object>.OkResponse("Xóa thành công"));
        }
    }
}