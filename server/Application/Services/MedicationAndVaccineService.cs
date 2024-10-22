using Application.Interfaces;
using AutoMapper;
using Core.Repositories;
using Microsoft.AspNetCore.Http;

namespace Application.Services
{
    public class MedicationAndVaccineService(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork, IMapper mapper) : IMedicationAndVaccineService
    {
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;

        private readonly IUnitOfWork unitOfWork = unitOfWork;

        private readonly IMapper mapper = mapper;

    }
}