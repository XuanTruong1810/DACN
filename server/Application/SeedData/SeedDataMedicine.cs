using Core.Entities;
using Core.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Application.SeedData;

public static class SeedDataMedicine
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        IUnitOfWork unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
        IGenericRepository<Medicines> medicineRepository = unitOfWork.GetRepository<Medicines>();
        IGenericRepository<MedicineSupplier> medicineSupplierRepository = unitOfWork.GetRepository<MedicineSupplier>();

        IEnumerable<Medicines> existingMedicines = await medicineRepository.GetAllAsync();
        if (existingMedicines.Any())
        {
            return;
        }

        List<Medicines> medicines = new List<Medicines>
        {
            // Vắc-xin bắt buộc cho heo 7 tuần tuổi trở lên
            new Medicines
            {
                Id = "MED0001",
                MedicineName = "Vắc xin FMD (Lở mồm long móng)",
                Description = "Vắc-xin phòng LMLM type O, A, Asia1",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = true,
                DaysAfterImport = 3,

            },
            new Medicines
            {
                Id = "MED0002",
                MedicineName = "Vắc xin Dịch tả",
                Description = "Vắc-xin phòng bệnh dịch tả heo",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = true,
                DaysAfterImport = 5,
            },
            new Medicines
            {
                Id = "MED0003",
                MedicineName = "Vắc xin PRRS (Tai xanh)",
                Description = "Vắc-xin phòng bệnh tai xanh",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = true,
                DaysAfterImport = 7,
            },


            // Thuốc kháng sinh
            new Medicines
            {
                Id = "MED0004",
                MedicineName = "Amoxicillin 20%",
                Description = "Kháng sinh điều trị nhiễm trùng",
                Usage = "Uống, 1 viên/con",
                Unit = "Viên",
                IsVaccine = false,
            },
            new Medicines
            {
                Id = "MED0005",
                MedicineName = "Tylosin 20%",
                Description = "Kháng sinh điều trị viêm phổi",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = false,
            },

            // Vắc-xin kháng sinh
            new Medicines
            {
                Id = "MED0006",
                MedicineName = "Vắc xin Tụ huyết trùng",
                Description = "Vắc-xin phòng bệnh tụ huyết trùng",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = false,
            },
            new Medicines
            {
                Id = "MED0007",
                MedicineName = "Vắc xin Phó thương hàn",
                Description = "Vắc-xin phòng bệnh phó thương hàn",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = false,
            },
            new Medicines
            {
                Id = "MED0008",
                MedicineName = "Vắc xin Mycoplasma",
                Description = "Vắc-xin phòng viêm phổi do Mycoplasma",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = false,
            },

            // Thuốc bổ
            new Medicines
            {
                Id = "MED0009",
                MedicineName = "Vitamin AD3E",
                Description = "Bổ sung vitamin tăng sức đề kháng",
                Usage = "Tiêm bắp, 1 liều/con",
                Unit = "Liều",
                IsVaccine = false,
            }
        };

        foreach (Medicines medicine in medicines)
        {
            await medicineRepository.InsertAsync(medicine);
        }

        // Liên kết thuốc với nhà cung cấp
        List<MedicineSupplier> medicineSuppliers = new List<MedicineSupplier>
        {
            // Đông Phương (SUP0003) - Chuyên vắc-xin
            new MedicineSupplier
            {
                MedicineId = "MED0001", // Vắc xin FMD
                SupplierId = "SUP0003",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0002", // Vắc xin Dịch tả
                SupplierId = "SUP0003",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0003", // Vắc xin PRRS
                SupplierId = "SUP0003",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0006", // Vắc xin Tụ huyết trùng
                SupplierId = "SUP0003",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0007", // Vắc xin Phó thương hàn
                SupplierId = "SUP0003",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0008", // Vắc xin Mycoplasma
                SupplierId = "SUP0003",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },

            // Cai Lậy VETVACO (SUP0004) - Thuốc và vitamin
            new MedicineSupplier
            {
                MedicineId = "MED0004", // Amoxicillin
                SupplierId = "SUP0004",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0005", // Tylosin
                SupplierId = "SUP0004",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0009", // Vitamin AD3E
                SupplierId = "SUP0004",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },

            // CP Việt Nam (SUP0005) - Cung cấp thêm vắc-xin
            new MedicineSupplier
            {
                MedicineId = "MED0001", // Vắc xin FMD
                SupplierId = "SUP0005",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0002", // Vắc xin Dịch tả
                SupplierId = "SUP0005",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            },
            new MedicineSupplier
            {
                MedicineId = "MED0003", // Vắc xin PRRS
                SupplierId = "SUP0005",
                Status = true,
                CreateTime = DateTimeOffset.UtcNow
            }
        };

        foreach (var medicineSupplier in medicineSuppliers)
        {
            await medicineSupplierRepository.InsertAsync(medicineSupplier);
        }

        await unitOfWork.SaveAsync();
    }
}