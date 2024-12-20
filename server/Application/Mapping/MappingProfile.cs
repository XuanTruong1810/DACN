using Application.DTOs;
using Application.DTOs.Customer;
using Application.DTOs.ExportPig;
using Application.DTOs.Food;
using Application.DTOs.FoodExport;
using Application.DTOs.FoodImport;
using Application.DTOs.FoodImportRequest;
using Application.DTOs.FoodType;
using Application.DTOs.Medicines;
using Application.DTOs.Pig;
using Application.Models;
using Application.Models.Customer;
using Application.Models.FoodExportModelView;
using Application.Models.FoodImportRequestModelView;
using Application.Models.FoodModelView;
using Application.Models.FoodTypeModelView;
using Application.Models.Medicine;
using Application.Models.PigCancelModelView;
using Application.Models.PigExport;
using AutoMapper;
using Core.Entities;

namespace Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AreaDTO, Areas>().ReverseMap();
            CreateMap<AreaModelView, Areas>().ReverseMap();

            CreateMap<SupplierDTO, Suppliers>().ReverseMap();
            CreateMap<Suppliers, SupplierModelView>().ReverseMap();

            CreateMap<StableDTO, Stables>().ReverseMap();
            CreateMap<StableModelView, Stables>().ReverseMap();

            CreateMap<PigIntakeInsertDTO, PigIntakes>().ReverseMap();

            CreateMap<PigIntakeUpdateDTO, PigIntakes>().ReverseMap();

            CreateMap<PigInTakeModelView, PigIntakes>().ReverseMap();

            CreateMap<PigIntakeAcceptDTO, PigIntakes>().ReverseMap();

            CreateMap<PigDTO, Pigs>().ReverseMap();
            CreateMap<PigModelView, Pigs>().ReverseMap();

            CreateMap<CreateFoodTypeDto, FoodTypes>().ReverseMap();
            CreateMap<UpdateFoodTypeDto, FoodTypes>().ReverseMap();
            CreateMap<FoodTypeModelView, FoodTypes>().ReverseMap();

            CreateMap<Foods, FoodModelView>()
            .ForMember(dest => dest.FoodTypeName,
                opt => opt.MapFrom(src => src.FoodTypes.FoodTypeName))
            .ForMember(dest => dest.FoodSupplierModelView,
                opt => opt.MapFrom(src => src.FoodSuppliers.Where(fs => fs.DeletedTime == null)
                    .Select(fs => new FoodSupplierModelView
                    {
                        SupplierId = fs.SuppliersId,
                        SupplierName = fs.Suppliers.Name,

                    })));
            CreateMap<FoodModelView, Foods>();
            CreateMap<CreateFoodDto, Foods>().ReverseMap();
            CreateMap<UpdateFoodDto, Foods>().ReverseMap();

            CreateMap<CreateFoodSupplierDto, FoodSuppliers>().ReverseMap();
            CreateMap<UpdateFoodSupplierDto, FoodSuppliers>().ReverseMap();

            CreateMap<CreateFoodImportRequestDto, FoodImportRequests>().ReverseMap();
            CreateMap<UpdateFoodImportRequestDto, FoodImportRequests>().ReverseMap();
            CreateMap<FoodImportRequestModelView, FoodImportRequests>().ReverseMap();

            CreateMap<CreateFoodImportDetailDto, FoodImportRequestDetails>().ReverseMap();
            CreateMap<UpdateFoodImportRequestDetailDto, FoodImportRequestDetails>().ReverseMap();
            CreateMap<FoodImportRequestDetailModelView, FoodImportRequestDetails>().ReverseMap();

            CreateMap<FoodImportRequests, FoodImportRequestModelView>()
                .ForMember(dest => dest.Details,
                    opt => opt.MapFrom(src => src.FoodImportRequestDetails));

            CreateMap<FoodImportRequestDetails, FoodImportRequestDetailModelView>()
                .ForMember(dest => dest.Food, opt => opt.MapFrom(src => src.Foods));

            CreateMap<Foods, FoodDetailModelView>()
                .ForMember(dest => dest.FoodTypeName,
                    opt => opt.MapFrom(src => src.FoodTypes.Id))
                .ForMember(dest => dest.AreaName,
                    opt => opt.MapFrom(src => src.Areas.Name))
                .ForMember(dest => dest.Suppliers,
                    opt => opt.MapFrom(src => src.FoodSuppliers
                        .Where(fs => fs.DeletedTime == null)
                        .Select(fs => new FoodSupplierModelView
                        {
                            SupplierId = fs.SuppliersId,
                            SupplierName = fs.Suppliers.Name,
                        })));
            CreateMap<Pigs, PigCancelModelView>().ReverseMap();
            CreateMap<PigCancelDTO, Pigs>().ReverseMap();


            CreateMap<InsertMedicineDTO, Medicines>().ReverseMap();
            CreateMap<UpdateMedicineDTO, Medicines>().ReverseMap();
            CreateMap<MedicineModelView, Medicines>().ReverseMap();


            CreateMap<CreatePigExportRequestDTO, PigExportRequest>().ReverseMap();
            CreateMap<PigExportRequest, PigExportRequestModelView>().ReverseMap();
            CreateMap<PigExportRequestDetail, PigExportRequestDetailModelView>().ReverseMap();


            CreateMap<CustomerDTO, Customers>().ReverseMap();
            CreateMap<CustomerModelView, Customers>().ReverseMap();

            CreateMap<PigExport, PigExportViewModel>().ReverseMap();


            CreateMap<CreateFoodExportDto, FoodExport>().ReverseMap();
            CreateMap<FoodExport, FoodExportModelView>().ReverseMap();
        }
    }
}