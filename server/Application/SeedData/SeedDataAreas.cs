using Core.Entities;
using Core.Repositories;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData
{
    public static class SeedDataAreas
    {
        public static async Task SeedAreas(IServiceProvider serviceProvider)
        {
            IUnitOfWork unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
            IGenericRepository<Areas>? areaRepository = unitOfWork.GetRepository<Areas>();

            // Kiểm tra xem đã có data chưa
            IEnumerable<Areas>? existingAreas = await areaRepository.GetAllAsync();
            if (existingAreas.Any())
            {
                return;
            }
            List<Areas>? areas = new List<Areas>
            {
                new Areas
                {
                    Id = "AREA0001",
                    Name = "Khu A",
                    Description = "Khu vực dành cho heo mới về và cần cách ly",
                    TotalHouses = 5,
                    OccupiedHouses = 0,
                    Status = "active",
                    WeighingFrequency = 7
                },
                new Areas
                {
                    Id = "AREA0002",
                    Name = "Khu B",
                    Description = "Khu nuôi heo thịt (Yêu cầu cân nặng tối thiểu: 30kg)",
                    TotalHouses = 7,
                    OccupiedHouses = 0,
                    Status = "active",
                    WeighingFrequency = 14
                },
                new Areas
                {
                    Id = "AREA0003",
                    Name = "Khu C",
                    Description = "Khu tăng trưởng & xuất chuồng (Dành cho heo từ 80kg - 105kg)",
                    TotalHouses = 5,
                    OccupiedHouses = 0,
                    Status = "active",
                    WeighingFrequency = 7
                },
                new Areas
                {
                    Id = "AREA0004",
                    Name = "Khu F",
                    Description = "Khu cách ly heo bệnh",
                    TotalHouses = 3,
                    OccupiedHouses = 0,
                    Status = "active",
                    WeighingFrequency = 3
                }
            };

            // Insert từng area
            foreach (Areas area in areas)
            {
                await areaRepository.InsertAsync(area);
            }
            await unitOfWork.SaveAsync();
        }
    }
}