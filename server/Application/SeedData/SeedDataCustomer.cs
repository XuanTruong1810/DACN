using Core.Entities;
using Core.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData
{
    public static class SeedDataCustomer
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            IUnitOfWork unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
            IGenericRepository<Customers> customerRepository = unitOfWork.GetRepository<Customers>();

            IEnumerable<Customers> existingCustomers = await customerRepository.GetAllAsync();
            if (existingCustomers.Any())
            {
                return;
            }

            List<Customers> customers = new List<Customers>
            {
                new Customers
                {
                    Id = "CUS0001",
                    Name = "Nguyễn Văn An",
                    CompanyName = "Công ty TNHH Thịt sạch Vissan",
                    Address = "420 Nơ Trang Long, P.13, Q.Bình Thạnh, TP.HCM",
                    Email = "nguyenvanan@vissan.com.vn",
                    Phone = "028 3553 3999",
                    Note = "Khách hàng thu mua số lượng lớn, thanh toán đúng hạn"
                },
                new Customers
                {
                    Id = "CUS0002",
                    Name = "Trần Thị Bình",
                    CompanyName = "Công ty TNHH MTV Thương mại Bình Minh",
                    Address = "Số 12, Đường số 2, KCN Tân Đông Hiệp, Dĩ An, Bình Dương",
                    Email = "binhtran@binhminh.com",
                    Phone = "0274 3719 789",
                    Note = "Khách hàng thường xuyên, có kế hoạch thu mua định kỳ"
                },
                new Customers
                {
                    Id = "CUS0003",
                    Name = "Lê Văn Cường",
                    CompanyName = "Công ty TNHH Thực phẩm Hùng Nhơn",
                    Address = "Ấp Tân Điền, Xã Tân Thạnh Tây, Củ Chi, TP.HCM",
                    Email = "cuongle@hungnhon.com",
                    Phone = "028 3792 0357",
                    Note = "Đối tác lâu năm, địa điểm gần trang trại"
                },
                new Customers
                {
                    Id = "CUS0004",
                    Name = "Phạm Thị Dung",
                    CompanyName = "Công ty CP Chế biến Thực phẩm Đồng Nai",
                    Address = "KCN Biên Hòa 1, TP.Biên Hòa, Đồng Nai",
                    Email = "dungpham@dnfood.com",
                    Phone = "0251 3836 251",
                    Note = "Khách hàng mới, cần theo dõi thanh toán"
                },
                new Customers
                {
                    Id = "CUS0005",
                    Name = "Hoàng Văn Em",
                    CompanyName = "Công ty TNHH Chế biến Thực phẩm Tân Tiến",
                    Address = "Lô C13, Đường N2, KCN Nam Tân Uyên, Bình Dương",
                    Email = "emhoang@tantien.com",
                    Phone = "0274 3652 147",
                    Note = "Khách hàng tiềm năng, có nhu cầu thu mua số lượng lớn"
                }
            };

            foreach (Customers customer in customers)
            {
                await customerRepository.InsertAsync(customer);
            }
            await unitOfWork.SaveAsync();
        }
    }
}