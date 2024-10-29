using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicationAndVaccineController(IMedicationAndVaccineService medicationAndVaccineService) : ControllerBase
    {
        private readonly IMedicationAndVaccineService medicationAndVaccineService = medicationAndVaccineService;

        [HttpGet]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> GetMedVacAsync([FromQuery] MedVacGetDTO medVacGetDTO)
        {
            BasePagination<MedVacGetModelView>? medVac = await medicationAndVaccineService.GetMedVacAsync(medVacGetDTO);
            return Ok(BaseResponse<BasePagination<MedVacGetModelView>>.OkResponse(medVac));
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> GetMedVacById(string id)
        {
            MedVacGetModelView? result = await medicationAndVaccineService.GetMedVacById(id);
            return Ok(BaseResponse<MedVacGetModelView>.OkResponse(result));
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> InsertMedVacAsync([FromBody] MedVacDTO medVac)
        {
            MedVacGetModelView? result = await medicationAndVaccineService.InsertMedVacAsync(medVac);
            return CreatedAtAction(nameof(GetMedVacById), new { id = result.Id }, BaseResponse<MedVacGetModelView>.CreatedResponse(result));
        }
        [HttpPatch]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> UpdateMedVacAsync([FromQuery] string medVacId, [FromBody] MedVacDTO medVacUpdate)
        {
            MedVacGetModelView? result = await medicationAndVaccineService.UpdateMedVacAsync(medVacId, medVacUpdate);
            return Ok(BaseResponse<MedVacGetModelView>.OkResponse(result));
        }
        [HttpDelete]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> DeleteMedVacAsync(string medVacId)
        {
            await medicationAndVaccineService.DeleteMedVacAsync(medVacId);
            return Ok(BaseResponse<object>.OkResponse("Xóa thành công!"));
        }
    }
}