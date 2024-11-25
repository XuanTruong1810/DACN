using Core.Entities;
using Core.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData
{
    public static class SeedDataFood
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            IUnitOfWork unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
            IGenericRepository<Foods> foodRepository = unitOfWork.GetRepository<Foods>();
            IGenericRepository<FoodSuppliers> foodSupplierRepository = unitOfWork.GetRepository<FoodSuppliers>();

            IEnumerable<Foods> existingFoods = await foodRepository.GetAllAsync();
            if (existingFoods.Any())
            {
                return;
            }

            List<Foods> foods = new List<Foods>
            {
                // CP Foods - Thức ăn heo con
                new Foods
                {
                    Id = "F0006",
                    Name = "CP Piglet 1",
                    Description = "Thức ăn CP cho heo con 7-15kg",
                    FoodTypesId = "FT0001",
                    Status = "active",
                    QuantityInStock = 100,
                    AreasId = "AREA0001",
                    QuantityPerMeal = 0.2,
                    MealsPerDay = 4
                },
                new Foods
                {
                    Id = "F0007",
                    Name = "CP Piglet 2",
                    Description = "Thức ăn CP cho heo con 15-30kg",
                    FoodTypesId = "FT0001",
                    Status = "active",
                    QuantityInStock = 150,
                    AreasId = "AREA0001",
                    QuantityPerMeal = 0.4,
                    MealsPerDay = 3
                },

                // JAPFA - Thức ăn heo thịt
                new Foods
                {
                    Id = "F0008",
                    Name = "JAPFA Grower 30",
                    Description = "Thức ăn JAPFA cho heo thịt 30-50kg",
                    FoodTypesId = "FT0002",
                    Status = "active",
                    QuantityInStock = 200,
                    AreasId = "AREA0002",
                    QuantityPerMeal = 0.8,
                    MealsPerDay = 3
                },
                new Foods
                {
                    Id = "F0009",
                    Name = "JAPFA Grower 50",
                    Description = "Thức ăn JAPFA cho heo thịt 50-80kg",
                    FoodTypesId = "FT0002",
                    Status = "active",
                    QuantityInStock = 250,
                    AreasId = "AREA0002",
                    QuantityPerMeal = 1.0,
                    MealsPerDay = 3
                },

                // GreenFeed - Thức ăn heo xuất chuồng
                new Foods
                {
                    Id = "F0010",
                    Name = "GreenFeed Finisher",
                    Description = "Thức ăn GreenFeed cho heo 80-105kg",
                    FoodTypesId = "FT0003",
                    Status = "active",
                    QuantityInStock = 300,
                    AreasId = "AREA0003",
                    QuantityPerMeal = 1.2,
                    MealsPerDay = 3
                }
            };

            // Insert Foods
            foreach (Foods food in foods)
            {
                await foodRepository.InsertAsync(food);
            }

            // Tạo liên kết Foods-Suppliers với nhà cung cấp có type là "pig"
            List<FoodSuppliers> foodSuppliers = new List<FoodSuppliers>
            {
                // CP Việt Nam (SUP0005 - type: pig)
                new FoodSuppliers
                {
                    FoodsId = "F0006",
                    SuppliersId = "SUP0005",
                    Status = "active",
                    CreatedTime = DateTimeOffset.Now
                },
                new FoodSuppliers
                {
                    FoodsId = "F0007",
                    SuppliersId = "SUP0005",
                    Status = "active",
                    CreatedTime = DateTimeOffset.Now
                },

                // JAPFA (SUP0006 - type: pig)
                new FoodSuppliers
                {
                    FoodsId = "F0008",
                    SuppliersId = "SUP0006",
                    Status = "active",
                    CreatedTime = DateTimeOffset.Now
                },
                new FoodSuppliers
                {
                    FoodsId = "F0009",
                    SuppliersId = "SUP0006",
                    Status = "active",
                    CreatedTime = DateTimeOffset.Now
                }
            };

            // Insert FoodSuppliers
            foreach (FoodSuppliers foodSupplier in foodSuppliers)
            {
                await foodSupplierRepository.InsertAsync(foodSupplier);
            }
        }
    }
}