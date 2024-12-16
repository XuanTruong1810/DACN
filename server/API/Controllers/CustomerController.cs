using Application.DTOs.Customer;
using Application.Interfaces;
using Application.Models.Customer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]

public class CustomerController(ICustomerService customerService) : ControllerBase
{
    private readonly ICustomerService _customerService = customerService;

    [HttpGet]
    public async Task<IActionResult> GetAllCustomers()
    {
        IEnumerable<CustomerModelView>? customers = await _customerService.GetAllCustomers();
        return Ok(BaseResponse<IEnumerable<CustomerModelView>>.OkResponse(customers));
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomerById(string id)
    {
        CustomerModelView? customer = await _customerService.GetCustomerById(id);
        return Ok(BaseResponse<CustomerModelView>.OkResponse(customer));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer(CustomerDTO customerDTO)
    {
        CustomerModelView? customer = await _customerService.CreateCustomer(customerDTO);
        return Ok(BaseResponse<CustomerModelView>.OkResponse(customer));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(string id, CustomerDTO customerDTO)
    {
        CustomerModelView? customer = await _customerService.UpdateCustomer(id, customerDTO);
        return Ok(BaseResponse<CustomerModelView>.OkResponse(customer));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(string id)
    {
        await _customerService.DeleteCustomer(id);
        return Ok(BaseResponse<string>.OkResponse("Xóa khách hàng thành công"));
    }
}