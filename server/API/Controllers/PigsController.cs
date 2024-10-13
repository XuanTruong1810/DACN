using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PigsController(IPigService pigService) : ControllerBase
    {
        private readonly IPigService pigService = pigService;

        [HttpPost]
        [Authorize(Roles = "Admin,Dispatch")]
        public async Task<IActionResult> Post(string AreasId, string id)
        {
            await pigService.AllocatePigsToStableAsync(AreasId, id);
            return Ok(BaseResponse<object>.OkResponse("Created successfully"));
        }
    }
}