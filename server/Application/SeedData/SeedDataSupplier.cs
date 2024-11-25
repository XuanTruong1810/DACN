using Core.Entities;
using Core.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData
{
    public static class SeedDataSupplier
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            IUnitOfWork unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
            IGenericRepository<Suppliers> supplierRepository = unitOfWork.GetRepository<Suppliers>();

            IEnumerable<Suppliers> existingSuppliers = await supplierRepository.GetAllAsync();
            if (existingSuppliers.Any())
            {
                return;
            }

            List<Suppliers> suppliers = new List<Suppliers>
            {
                // Nhà cung cấp thức ăn
                new() {
                    Id = "SUP0001",
                    Name = "Công ty TNHH De Heus",
                    Address = "Đường số 4, KCN Sóng Thần 3, Phường Phú Tân, TP.Thủ Dầu Một, Bình Dương",
                    Email = "nguyenxuantruong18102003@gmail.com",
                    Phone = "0274 3567 567",
                    Status = "active",
                    TypeSuppier = "food"
                },
                new() {
                    Id = "SUP0002",
                    Name = "Công ty TNHH CJ Vina Agri",
                    Address = "Đường số 7, KCN Long Thành, Đồng Nai",
                    Email = "nguyenxuantruong18102003@gmail.com",
                    Phone = "0251 3514 288",
                    Status = "active",
                    TypeSuppier = "food"
                },

                // Nhà cung cấp thuốc thú y
                new() {
                    Id = "SUP0003",
                    Name = "Công ty TNHH Thuốc Thú y Đông Phương",
                    Address = "345 Lê Trọng Tấn, P. Sơn Kỳ, Q. Tân Phú, TP.HCM",
                    Email = "nguyenxuantruong18102003@gmail.com",
                    Phone = "028 3816 2884",
                    Status = "active",
                    TypeSuppier = "medicine"
                },
                new() {
                    Id = "SUP0004",
                    Name = "Công ty CP Dược Thú y Cai Lậy",
                    Address = "Khu 5, P.1, TX Cai Lậy, Tiền Giang",
                    Email = "nguyenxuantruong18102003@gmail.com",
                    Phone = "0273 3826 462",
                    Status = "active",
                    TypeSuppier = "medicine"
                },

                // Nhà cung cấp heo giống
                new() {
                    Id = "SUP0005",
                    Name = "Công ty TNHH Chăn nuôi CP Việt Nam",
                    Address = "Số 2, Đường 2A, KCN Biên Hòa 2, Đồng Nai",
                    Email = "nguyenxuantruong18102003@gmail.com",
                    Phone = "0251 3836 251",
                    Status = "active",
                    TypeSuppier = "pig"
                },
                new() {
                    Id = "SUP0006",
                    Name = "Công ty TNHH JAPFA COMFEED Việt Nam",
                    Address = "Đường số 7, KCN Long Bình, Biên Hòa, Đồng Nai",
                    Email = "jnguyenxuantruong18102003@gmail.com",
                    Phone = "0251 3836 251",
                    Status = "active",
                    TypeSuppier = "pig"
                }
            };

            foreach (Suppliers supplier in suppliers)
            {
                await supplierRepository.InsertAsync(supplier);
            }
            await unitOfWork.SaveAsync();
        }
    }
}