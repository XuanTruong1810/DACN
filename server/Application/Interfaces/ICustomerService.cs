using Application.DTOs.Customer;
using Application.Models.Customer;

namespace Application.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerModelView>> GetAllCustomers();
        Task<CustomerModelView> GetCustomerById(string id);
        Task<CustomerModelView> CreateCustomer(CustomerDTO customerDTO);
        Task<CustomerModelView> UpdateCustomer(string id, CustomerDTO customerDTO);
        Task DeleteCustomer(string id);
    }
}