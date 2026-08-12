using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Dtos;
using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly WarehouseDbContext _context;

    public DashboardController(WarehouseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ToListAsync();

        var products = await _context.Products.ToListAsync();

        var totalOrders = orders.Count;
        var pickingCount = orders.Count(o => o.Status == OrderStatus.Picking);
        var packedCount = orders.Count(o => o.Status == OrderStatus.Packed);
        var shippedCount = orders.Count(o => o.Status == OrderStatus.Shipped);
        var invoicedCount = orders.Count(o => o.Status == OrderStatus.Invoiced);

        var totalRevenue = orders.Sum(o => o.OrderItems.Sum(i => i.Quantity * i.UnitPrice));

        var dashboard = new DashboardDto
        {
            TotalOrders = totalOrders,
            Picking = pickingCount,
            Packed = packedCount,
            Shipped = shippedCount,
            Invoiced = invoicedCount,
            TotalProducts = products.Count,
            TotalRevenue = totalRevenue
        };

        return Ok(dashboard);
    }
}
