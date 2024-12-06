using Application.Interfaces;
using Application.Models.PigExamination;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PigExaminationController(IPigExaminationService pigExaminationService) : ControllerBase
    {
        private readonly IPigExaminationService _pigExaminationService = pigExaminationService;

        [HttpGet]
        public async Task<IActionResult> GetPigExaminationAsync(string examinationType)
        {
            List<PigExaminationModelView>? result = await _pigExaminationService.GetPigExaminationAsync(examinationType);
            return Ok(BaseResponse<List<PigExaminationModelView>>.OkResponse(result));
        }
    }
}