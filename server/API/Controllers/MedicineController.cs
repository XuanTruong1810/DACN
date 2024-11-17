using Application.DTOs.Medicines;
using Application.Interfaces;
using Application.Models.Medicine;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class MedicineController(IMedicineService medicineService) : ControllerBase
    {
        private readonly IMedicineService _medicineService = medicineService;
        [HttpGet]
        public async Task<IActionResult> GetAllMedicines()
        {
            List<MedicineModelView>? medicines = await _medicineService.GetAllMedicines();
            return Ok(BaseResponse<IEnumerable<MedicineModelView>>.OkResponse(medicines));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineById(string id)
        {
            MedicineModelView? medicine = await _medicineService.GetMedicineById(id);
            return Ok(BaseResponse<MedicineModelView>.OkResponse(medicine));
        }

        [HttpPost]
        public async Task<IActionResult> CreateMedicine(InsertMedicineDTO dto)
        {
            MedicineModelView? result = await _medicineService.InsertMedicine(dto);
            return CreatedAtAction(nameof(GetMedicineById), new { id = result.Id }, BaseResponse<MedicineModelView>.CreatedResponse(result));
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateMedicine(string id, UpdateMedicineDTO dto)
        {
            MedicineModelView? result = await _medicineService.UpdateMedicine(id, dto);
            return Ok(BaseResponse<MedicineModelView>.OkResponse(result));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicine(string id)
        {
            await _medicineService.DeleteMedicine(id);
            return NoContent();
        }
    }
}