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
    public class FeedIntakeController(IFeedIntakeService feedIntakeService) : ControllerBase
    {
        private readonly IFeedIntakeService feedIntakeService = feedIntakeService;
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetFeedIntake(DateTimeOffset? date, string? supplierId, string? statusManager, string? inStock, string? id, int pageIndex, int pageSize)
        {
            return Ok(await feedIntakeService.GetFeedIntake(date, supplierId, statusManager, inStock, id, pageIndex, pageSize));
        }
        [HttpPost]
        [Authorize(Roles = "FeedManager")]
        public async Task<IActionResult> CreateFeedIntake([FromBody] List<FeedIntakeInsertDTO> feedIntakeInsertDTOs)
        {
            await feedIntakeService.CreateFeedIntake(feedIntakeInsertDTOs);
            return Ok(BaseResponse<object>.OkResponse("Tạo thành công"));
        }
        [HttpGet("Recommend")]
        [Authorize(Roles = "FeedManager")]
        public async Task<IActionResult> GetFeedRequirementsForArea([FromQuery] string areaId, [FromQuery] int numberOfDays, [FromQuery] int pageIndex, [FromQuery] int pageSize)
        {
            BasePagination<FeedRequirementModelView>? result = await feedIntakeService.GetFeedRequirementsForArea(areaId, numberOfDays, pageIndex, pageSize);
            return Ok(BaseResponse<BasePagination<FeedRequirementModelView>>.OkResponse(result));
        }
        [HttpPatch("AcceptFeedIntake")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AcceptFeedIntake(string feedInTakeId, [FromBody] FeedIntakeAcceptDTO feedIntakeAcceptDTO)
        {
            await feedIntakeService.AcceptFeedIntake(feedInTakeId, feedIntakeAcceptDTO);
            return Ok(BaseResponse<object>.OkResponse("Chấp thuận thành công"));
        }
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelFeedIntake(string feedInTakeId)
        {
            await feedIntakeService.CancelFeedIntake(feedInTakeId);
            return Ok(BaseResponse<object>.OkResponse("Xóa thành công"));
        }

        [HttpPatch("FeedIntakeDelivery")]
        [Authorize(Roles = "Admin, FeedManager")]
        public async Task<IActionResult> FeedIntakeDelivery(string feedInTakeId, [FromBody] FeedIntakeDeliveryDTO deliveryDTOs)
        {
            await feedIntakeService.FeedIntakeDelivery(feedInTakeId, deliveryDTOs);
            return Ok(BaseResponse<object>.OkResponse("Đặt hóa thành công"));
        }

        [HttpPost("UpdateQuantityForFeed")]
        [Authorize(Roles = "FeedManager, Admin")]
        public async Task<IActionResult> UpdateQuantityForFeed(string feedIntakeId)
        {
            await feedIntakeService.UpdateQuantityForFeed(feedIntakeId);
            return Ok(BaseResponse<object>.OkResponse("Thêm vào kho thành công"));
        }
    }
}