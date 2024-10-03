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
            CreateMap<SupplierDTO, Areas>().ReverseMap();
            CreateMap<Suppliers, SupplierModelView>().ReverseMap();
        }
    }
}