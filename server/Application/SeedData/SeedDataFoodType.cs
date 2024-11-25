using Core.Entities;
using Core.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData
{
    public static class SeedDataFoodType
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            IUnitOfWork unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
            IGenericRepository<FoodTypes> foodTypeRepository = unitOfWork.GetRepository<FoodTypes>();

            IEnumerable<FoodTypes> existingFoodTypes = await foodTypeRepository.GetAllAsync();
            if (existingFoodTypes.Any())
            {
                return;
            }

            List<FoodTypes> foodTypes = new List<FoodTypes>
            {
                new FoodTypes
                {
                    Id = "FT0001",
                    FoodTypeName = "Thức ăn heo con",
                    Description = "Thức ăn dành cho heo con từ 7-30kg, giàu đạm và khoáng chất",
                    Status = "active",
                    TotalProducts = 0
                },
                new FoodTypes
                {
                    Id = "FT0002",
                    FoodTypeName = "Thức ăn heo thịt",
                    Description = "Thức ăn cho heo thịt từ 30-80kg, cân bằng dinh dưỡng tăng trọng",
                    Status = "active",
                    TotalProducts = 0
                },
                new FoodTypes
                {
                    Id = "FT0003",
                    FoodTypeName = "Thức ăn heo xuất chuồng",
                    Description = "Thức ăn cho heo từ 80-105kg, tối ưu tăng trọng giai đoạn cuối",
                    Status = "active",
                    TotalProducts = 0
                },
                new FoodTypes
                {
                    Id = "FT0004",
                    FoodTypeName = "Cám đặc biệt",
                    Description = "Thức ăn bổ sung dinh dưỡng cho heo yếu hoặc mới ốm dậy",
                    Status = "active",
                    TotalProducts = 0
                },
                new FoodTypes
                {
                    Id = "FT0005",
                    FoodTypeName = "Thức ăn tăng trọng",
                    Description = "Thức ăn bổ sung giúp tăng trọng nhanh cho heo chậm lớn",
                    Status = "active",
                    TotalProducts = 0
                }
            };

            foreach (FoodTypes foodType in foodTypes)
            {
                await foodTypeRepository.InsertAsync(foodType);
            }
            await unitOfWork.SaveAsync();
        }
    }
}