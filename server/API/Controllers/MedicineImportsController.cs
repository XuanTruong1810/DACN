using Application.DTOs.MedicineImport;
using Application.Interfaces;
using Application.Models.MedicineImportModelView;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineImportsController : ControllerBase
    {
        private readonly IMedicineImportService _medicineImportService;
        public MedicineImportsController(IMedicineImportService medicineImportService)
        {
            _medicineImportService = medicineImportService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineImportById(string id)
        {
            MedicineImportModelView? result = await _medicineImportService.GetMedicineImportById(id);
            return Ok(BaseResponse<MedicineImportModelView>.OkResponse(result));
        }

        [HttpGet]
        public async Task<IActionResult> GetMedicineImports()
        {
            List<MedicineImportModelView>? result = await _medicineImportService.GetMedicineImports();
            return Ok(BaseResponse<List<MedicineImportModelView>>.OkResponse(result));
        }

        [HttpPost("{id}/delivery")]
        public async Task<IActionResult> DeliveryMedicineImport(string id, MedicineImportAcceptIntakeDTO dto)
        {
            MedicineImportModelView? result = await _medicineImportService.DeliveryMedicineImport(id, dto);
            return Ok(BaseResponse<MedicineImportModelView>.OkResponse(result));
        }

        [HttpPost("{id}/stock")]
        public async Task<IActionResult> StockMedicineImport(string id)
        {
            MedicineImportModelView? result = await _medicineImportService.StockMedicineImport(id);
            return Ok(BaseResponse<MedicineImportModelView>.OkResponse(result));
        }
    }
}