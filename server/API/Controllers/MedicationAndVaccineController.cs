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
        [HttpPost]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> InsertMedVacAsync([FromBody] MedVacDTO medVac)
        {
            await medicationAndVaccineService.InsertMedVacAsync(medVac);
            return Ok(BaseResponse<object>.OkResponse("Thêm thành công!"));
        }

        [HttpPut]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> UpdateMedVacAsync([FromQuery] string medVacId, [FromBody] MedVacDTO medVacUpdate)
        {
            await medicationAndVaccineService.UpdateMedVacAsync(medVacId, medVacUpdate);
            return Ok(BaseResponse<object>.OkResponse("Cập nhật thành công!"));
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