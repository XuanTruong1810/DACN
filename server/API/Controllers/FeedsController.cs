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
    public class FeedsController(IFeedService feedService) : ControllerBase
    {
        private readonly IFeedService feedService = feedService;
        [HttpGet]
        [Authorize(Roles = "Admin, FeedManager")]
        public async Task<IActionResult> Get([FromQuery] FeedGetDTO dto)
        {
            BasePagination<FeedGetModel>? result = await feedService.GetFeedAsync(dto);
            return Ok(BaseResponse<BasePagination<FeedGetModel>>.OkResponse(result));
        }
        [HttpPost]
        [Authorize(Roles = "Admin, FeedManager")]
        public async Task<IActionResult> Post([FromBody] FeedInsertDTO dto)
        {
            await feedService.InsertFeedAsync(dto);
            return Ok(BaseResponse<object>.OkResponse("Thêm thành công!"));
        }

        [HttpPatch]
        [Authorize(Roles = "Admin, FeedManager")]
        public async Task<IActionResult> Patch([FromQuery] string id, [FromBody] FeedUpdateDTO? dto)
        {
            await feedService.UpdateFeedAsync(id, dto);
            return Ok(BaseResponse<object>.OkResponse("Cập nhật thành công!"));
        }
        [HttpDelete]
        [Authorize(Roles = "Admin, FeedManager")]
        public async Task<IActionResult> Delete([FromQuery] string id)
        {
            await feedService.DeleteFeedAsync(id);
            return Ok(BaseResponse<object>.OkResponse("Xóa thành công!"));
        }
    }
}