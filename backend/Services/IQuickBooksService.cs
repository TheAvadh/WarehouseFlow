using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Services;

public interface IQuickBooksService
{
    Task<string> GenerateInvoiceAsync(Order order);
}
