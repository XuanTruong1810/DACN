using Application.Interfaces;
using Application.Models.VaccinationPlan;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaccinationPlanController(IVaccinationPlanService vaccinationPlanService) : ControllerBase
    {
        private readonly IVaccinationPlanService _vaccinationPlanService = vaccinationPlanService;

        [HttpGet]
        public async Task<IActionResult> GetVaccinationPlanAsync()
        {
            List<VaccinationPlanModelView>? result = await _vaccinationPlanService.GetVaccinationPlanAsync();
            return Ok(BaseResponse<List<VaccinationPlanModelView>>.OkResponse(result));
        }
    }
}