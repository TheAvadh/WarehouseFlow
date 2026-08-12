using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Dtos;
using WarehouseFlow.Backend.Models;
using WarehouseFlow.Backend.Services;

namespace WarehouseFlow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly WarehouseDbContext _context;
    private readonly IQuickBooksService _quickBooksService;

    public OrdersController(WarehouseDbContext context, IQuickBooksService quickBooksService)
    {
        _context = context;
        _quickBooksService = quickBooksService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var result = orders.Select(MapToDto).ToList();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = $"Order with ID '{id}' was not found." });
        }

        return Ok(MapToDto(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (dto == null || dto.Items == null || dto.Items.Count == 0)
        {
            return BadRequest(new { message = "Order must contain at least one line item." });
        }

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == dto.CustomerId);
        if (customer == null)
        {
            customer = await _context.Customers.FirstOrDefaultAsync();
            if (customer == null)
            {
                return BadRequest(new { message = "Invalid customer specified and no default customer exists." });
            }
        }

        var orderItems = new List<OrderItem>();
        foreach (var itemDto in dto.Items)
        {
            if (itemDto.Quantity <= 0) continue;

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == itemDto.ProductId);
            if (product == null)
            {
                return BadRequest(new { message = $"Product with ID '{itemDto.ProductId}' was not found." });
            }

            orderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Quantity = itemDto.Quantity,
                UnitPrice = product.Price
            });
        }

        if (orderItems.Count == 0)
        {
            return BadRequest(new { message = "Order must contain at least one valid line item with quantity > 0." });
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            Customer = customer,
            Status = OrderStatus.Created,
            CreatedAt = DateTime.UtcNow,
            OrderItems = orderItems
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var reloadedOrder = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .FirstAsync(o => o.Id == order.Id);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToDto(reloadedOrder));
    }

    [HttpPost("{id:guid}/pick")]
    public async Task<ActionResult<OrderDto>> PickOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = $"Order with ID '{id}' was not found." });
        }

        if (order.Status != OrderStatus.Created)
        {
            return BadRequest(new { message = $"Cannot start picking. Order status is currently '{order.Status}', but expected 'Created'." });
        }

        foreach (var item in order.OrderItems)
        {
            if (item.Product != null)
            {
                item.Product.AvailableQuantity = Math.Max(0, item.Product.AvailableQuantity - item.Quantity);
            }
        }

        order.Status = OrderStatus.Picking;
        await _context.SaveChangesAsync();

        return Ok(MapToDto(order));
    }

    [HttpPost("{id:guid}/pack")]
    public async Task<ActionResult<OrderDto>> PackOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = $"Order with ID '{id}' was not found." });
        }

        if (order.Status != OrderStatus.Picking)
        {
            return BadRequest(new { message = $"Cannot pack order. Order status must be 'Picking', but is currently '{order.Status}'." });
        }

        order.Status = OrderStatus.Packed;
        await _context.SaveChangesAsync();

        return Ok(MapToDto(order));
    }

    [HttpPost("{id:guid}/ship")]
    public async Task<ActionResult<OrderDto>> ShipOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = $"Order with ID '{id}' was not found." });
        }

        if (order.Status != OrderStatus.Packed)
        {
            return BadRequest(new { message = $"Cannot ship order. Order status must be 'Packed', but is currently '{order.Status}'." });
        }

        order.Status = OrderStatus.Shipped;
        await _context.SaveChangesAsync();

        return Ok(MapToDto(order));
    }

    [HttpPost("{id:guid}/invoice")]
    public async Task<ActionResult<OrderDto>> InvoiceOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = $"Order with ID '{id}' was not found." });
        }

        if (order.Status != OrderStatus.Shipped && order.Status != OrderStatus.Invoiced)
        {
            return BadRequest(new { message = $"Cannot invoice order. Order status must be 'Shipped' or 'Invoiced', but is currently '{order.Status}'." });
        }

        var invoiceId = await _quickBooksService.GenerateInvoiceAsync(order);
        order.Status = OrderStatus.Invoiced;
        await _context.SaveChangesAsync();

        return Ok(MapToDto(order));
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = order.Customer?.Name ?? "Unknown Customer",
            Status = order.Status.ToString(),
            StatusInt = (int)order.Status,
            CreatedAt = order.CreatedAt,
            QuickBooksInvoiceId = order.QuickBooksInvoiceId,
            TotalAmount = order.OrderItems.Sum(i => i.Quantity * i.UnitPrice),
            TotalItems = order.OrderItems.Sum(i => i.Quantity),
            Items = order.OrderItems.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductSKU = i.Product?.SKU ?? "N/A",
                ProductName = i.Product?.Name ?? "Unknown Product",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };
    }
}
