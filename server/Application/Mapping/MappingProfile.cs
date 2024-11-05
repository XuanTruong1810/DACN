using Application.DTOs;
using Application.Models;
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



            // CreateMap<MedVacDTO, MedicationAndVaccines>().ReverseMap();
            // CreateMap<MedVacGetDTO, MedicationAndVaccines>().ReverseMap();
            // CreateMap<MedVacGetModelView, MedicationAndVaccines>().ReverseMap();


            // CreateMap<MedVacIntakeDTO, MedicationAndVaccines>().ReverseMap();

            // CreateMap<MedVacIntakeAcceptDTO, MedicationAndVaccines>().ReverseMap();



            // CreateMap<HealthRecordCreateDto, HealthRecords>().ReverseMap();

            // CreateMap<HealthRecordDetailDTO, HealthRecordDetails>().ReverseMap();





        }
    }
}