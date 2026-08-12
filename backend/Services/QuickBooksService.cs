using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Services;

public class QuickBooksService : IQuickBooksService
{
    private readonly WarehouseDbContext _context;
    private static readonly Random _random = new();

    public QuickBooksService(WarehouseDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateInvoiceAsync(Order order)
    {
        // Simulate 1-second network delay
        await Task.Delay(1000);

        // Check if invoice ID was already generated for this order (Idempotency)
        if (!string.IsNullOrEmpty(order.QuickBooksInvoiceId))
        {
            return order.QuickBooksInvoiceId;
        }

        // DocNumber based on order ID
        string docNumber = $"WF-ORD-{order.Id.ToString()[..8].ToUpper()}";

        // Generate a mock QuickBooks invoice ID
        int nextNum = _random.Next(1000, 9999);
        string invoiceId = $"INV-{nextNum}";

        order.QuickBooksInvoiceId = invoiceId;
        await _context.SaveChangesAsync();

        return invoiceId;
    }
}
