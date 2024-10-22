using Application.Interfaces;
using AutoMapper;
using Core.Repositories;
using Microsoft.AspNetCore.Http;

namespace Application.Services
{
    public class MedicationAndVaccineIntakeService(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork, IMapper mapper) : IMedicationAndVaccineIntakeService
    {
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;
    }
}