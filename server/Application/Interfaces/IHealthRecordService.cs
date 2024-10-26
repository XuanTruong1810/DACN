using Application.DTOs;

namespace Application.Interfaces
{
    public interface IHealthRecordService
    {
        Task CreateHealthRecordAsync(HealthRecordCreateDto healthRecordDto);


    }
}