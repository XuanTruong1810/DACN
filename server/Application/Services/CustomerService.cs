using Application.DTOs.Customer;
using Application.Interfaces;
using Application.Models.Customer;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class CustomerService(IUnitOfWork unitOfWork, IMapper mapper) : ICustomerService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;

        public async Task<CustomerModelView> CreateCustomer(CustomerDTO customerDTO)
        {
            Customers? lastCustomer = await _unitOfWork.GetRepository<Customers>()
                .GetEntities
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            string newId = "CUS0001";
            if (lastCustomer != null)
            {
                int currentNumber = int.Parse(lastCustomer.Id[3..]);
                newId = $"CUS{(currentNumber + 1):D4}";
            }

            Customers customer = _mapper.Map<Customers>(customerDTO);
            customer.Id = newId;

            await _unitOfWork.GetRepository<Customers>().InsertAsync(customer);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<CustomerModelView>(customer);
        }

        public async Task DeleteCustomer(string id)
        {
            Customers? customer = await _unitOfWork.GetRepository<Customers>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy khách hàng");

            customer.DeleteTime = DateTimeOffset.Now;

            await _unitOfWork.GetRepository<Customers>().UpdateAsync(customer);
            await _unitOfWork.SaveAsync();
        }

        public async Task<IEnumerable<CustomerModelView>> GetAllCustomers()
        {
            IEnumerable<Customers> customers = await _unitOfWork.GetRepository<Customers>().GetEntities
            .Where(x => x.DeleteTime == null)
            .ToListAsync();
            return _mapper.Map<IEnumerable<CustomerModelView>>(customers);
        }

        public async Task<CustomerModelView> GetCustomerById(string id)
        {
            Customers? customer = await _unitOfWork.GetRepository<Customers>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy khách hàng");
            return _mapper.Map<CustomerModelView>(customer);
        }

        public async Task<CustomerModelView> UpdateCustomer(string id, CustomerDTO customerDTO)
        {
            Customers? customer = await _unitOfWork.GetRepository<Customers>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy khách hàng");
            _mapper.Map(customerDTO, customer);
            await _unitOfWork.GetRepository<Customers>().UpdateAsync(customer);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<CustomerModelView>(customer);
        }
    }
}