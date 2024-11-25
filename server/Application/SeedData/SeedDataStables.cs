using Core.Entities;
using Core.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData
{
    public static class SeedDataStables
    {
        public static async Task SeedStables(IServiceProvider serviceProvider)
        {
            IUnitOfWork unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
            IGenericRepository<Stables>? stableRepository = unitOfWork.GetRepository<Stables>();

            IEnumerable<Stables>? existingStables = await stableRepository.GetAllAsync();
            if (existingStables.Any())
            {
                return;
            }

            List<Stables>? stables = new List<Stables>();
            for (int i = 1; i <= 5; i++)
            {
                stables.Add(new Stables
                {
                    Id = $"STB{i:D4}", // STABLE0001, STABLE0002,...
                    Name = $"Chuồng A{i}",
                    Status = StatusStables.Available,
                    AreasId = "AREA0001",
                    Humidity = "50",
                    Temperature = "25",
                    Capacity = 15,
                    CurrentOccupancy = 0
                });
            }

            // Khu B - 7 chuồng
            for (int i = 6; i <= 12; i++)
            {
                stables.Add(new Stables
                {
                    Id = $"STB{i:D4}", // STABLE0006, STABLE0007,...
                    Name = $"Chuồng B{i - 5}", // Chuồng B1, Chuồng B2,...
                    Status = StatusStables.Available,
                    AreasId = "AREA0002",
                    Humidity = "50",
                    Temperature = "25",
                    Capacity = 10,
                    CurrentOccupancy = 0
                });
            }

            // Khu C - 5 chuồng
            for (int i = 13; i <= 17; i++)
            {
                stables.Add(new Stables
                {
                    Id = $"STABLE{i:D4}",
                    Name = $"Chuồng C{i - 12}",
                    Status = StatusStables.Available,
                    AreasId = "AREA0003",
                    Humidity = "50",
                    Temperature = "25",
                    Capacity = 15,
                    CurrentOccupancy = 0
                });
            }

            // Khu F - 3 chuồng
            for (int i = 18; i <= 20; i++)
            {
                stables.Add(new Stables
                {
                    Id = $"STABLE{i:D4}",
                    Name = $"Chuồng F{i - 17}",
                    Status = StatusStables.Available,
                    AreasId = "AREA0004",
                    Humidity = "50",
                    Temperature = "25",
                    Capacity = 10,
                    CurrentOccupancy = 0
                });
            }

            // Insert từng chuồng
            foreach (Stables stable in stables)
            {
                await stableRepository.InsertAsync(stable);
            }
            await unitOfWork.SaveAsync();
        }
    }
}
