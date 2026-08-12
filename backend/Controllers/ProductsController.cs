using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Dtos;
using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly WarehouseDbContext _context;

    public ProductsController(WarehouseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        var products = await _context.Products
            .Select(p => new ProductDto
            {
                Id = p.Id,
                SKU = p.SKU,
                Name = p.Name,
                Price = p.Price,
                AvailableQuantity = p.AvailableQuantity
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID '{id}' was not found." });
        }

        return Ok(new ProductDto
        {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            Price = product.Price,
            AvailableQuantity = product.AvailableQuantity
        });
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.SKU))
        {
            return BadRequest(new { message = "Product SKU and Name are required." });
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            SKU = dto.SKU.Trim().ToUpper(),
            Name = dto.Name.Trim(),
            Price = Math.Max(0, dto.Price),
            AvailableQuantity = Math.Max(0, dto.AvailableQuantity)
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, new ProductDto
        {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            Price = product.Price,
            AvailableQuantity = product.AvailableQuantity
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.SKU))
        {
            return BadRequest(new { message = "Product SKU and Name are required." });
        }

        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID '{id}' was not found." });
        }

        product.SKU = dto.SKU.Trim().ToUpper();
        product.Name = dto.Name.Trim();
        product.Price = Math.Max(0, dto.Price);
        product.AvailableQuantity = Math.Max(0, dto.AvailableQuantity);

        await _context.SaveChangesAsync();

        return Ok(new ProductDto
        {
            Id = product.Id,
            SKU = product.SKU,
            Name = product.Name,
            Price = product.Price,
            AvailableQuantity = product.AvailableQuantity
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID '{id}' was not found." });
        }

        var isUsedInOrders = await _context.OrderItems.AnyAsync(i => i.ProductId == id);
        if (isUsedInOrders)
        {
            return BadRequest(new { message = "Cannot delete product because it is referenced in order manifests." });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
