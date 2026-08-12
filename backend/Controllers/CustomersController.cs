using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Dtos;
using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly WarehouseDbContext _context;

    public CustomersController(WarehouseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        var customers = await _context.Customers
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            return NotFound(new { message = $"Customer with ID '{id}' was not found." });
        }

        return Ok(new CustomerDto { Id = customer.Id, Name = customer.Name });
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Customer name is required." });
        }

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim()
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(Guid id, [FromBody] UpdateCustomerDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Customer name is required." });
        }

        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            return NotFound(new { message = $"Customer with ID '{id}' was not found." });
        }

        customer.Name = dto.Name.Trim();
        await _context.SaveChangesAsync();

        return Ok(new CustomerDto { Id = customer.Id, Name = customer.Name });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            return NotFound(new { message = $"Customer with ID '{id}' was not found." });
        }

        var hasOrders = await _context.Orders.AnyAsync(o => o.CustomerId == id);
        if (hasOrders)
        {
            return BadRequest(new { message = "Cannot delete customer because they have active order history." });
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
