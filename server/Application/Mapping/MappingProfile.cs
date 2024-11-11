using Application.DTOs;
using Application.DTOs.Food;
using Application.DTOs.FoodType;
using Application.Models;
using Application.Models.FoodModelView;
using Application.Models.FoodTypeModelView;
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

            CreateMap<FeedInTakeDetails, FeedIntakeInsertDTO>().ReverseMap();

            CreateMap<FeedIntakeResponseModel, FeedInTakes>().ReverseMap();

            CreateMap<FeedIntakeAcceptDTO, FeedInTakes>().ReverseMap();

            CreateMap<FeedInsertDTO, Feeds>().ReverseMap();
            CreateMap<FeedUpdateDTO, Feeds>().ReverseMap();
            CreateMap<FeedGetModel, Feeds>().ReverseMap();

            CreateMap<FeedTypeNonQueryDTO, FeedTypes>().ReverseMap();
            CreateMap<FeedTypeGetModel, FeedTypes>().ReverseMap();

            CreateMap<PigDTO, Pigs>().ReverseMap();
            CreateMap<PigModelView, Pigs>().ReverseMap();


            // CreateMap<MedVacDTO, MedicationAndVaccines>().ReverseMap();
            // CreateMap<MedVacGetDTO, MedicationAndVaccines>().ReverseMap();
            // CreateMap<MedVacGetModelView, MedicationAndVaccines>().ReverseMap();


            // CreateMap<MedVacIntakeDTO, MedicationAndVaccines>().ReverseMap();

            // CreateMap<MedVacIntakeAcceptDTO, MedicationAndVaccines>().ReverseMap();



            // CreateMap<HealthRecordCreateDto, HealthRecords>().ReverseMap();

            // CreateMap<HealthRecordDetailDTO, HealthRecordDetails>().ReverseMap();

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
                        QuantityInStock = fs.QuantityInStock,
                        Status = fs.Status,
                    })));
            CreateMap<FoodModelView, Foods>();
            CreateMap<CreateFoodDto, Foods>().ReverseMap();
            CreateMap<UpdateFoodDto, Foods>().ReverseMap();

            CreateMap<CreateFoodSupplierDto, FoodSuppliers>().ReverseMap();
            CreateMap<UpdateFoodSupplierDto, FoodSuppliers>().ReverseMap();




        }
    }
}