using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PigsController(IPigService pigService) : ControllerBase
    {
        private readonly IPigService pigService = pigService;
        [HttpPost]
        public async Task<IActionResult> Post(string id)
        {
            await pigService.AllocatePigsToStableAsync(id);
            return Ok(BaseResponse<object>.OkResponse("Created successfully"));
        }
    }
}