using Application.DTOs.Vaccination;
using Application.Interfaces;
using Application.Models.VaccinationPlan;
using Microsoft.AspNetCore.Authorization;
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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> InsertVaccinationPlanAsync(VaccinationInsertDTO vaccinationInsertDTO)
        {
            bool result = await _vaccinationPlanService.InsertVaccinationPlanAsync(vaccinationInsertDTO);
            return Ok(BaseResponse<object>.OkResponse("Tạo phiếu tiêm chủng thành công!"));
        }
        [HttpGet("pigs")]
        public async Task<IActionResult> GetPigScheduleByVaccineIdAsync(string vaccineId, DateTimeOffset date)
        {
            List<PigSchedule> result = await _vaccinationPlanService.GetPigScheduleByVaccineIdAsync(vaccineId, date);
            return Ok(BaseResponse<List<PigSchedule>>.OkResponse(result));
        }
    }
}