using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Data;

public static class DbInitializer
{
    public static void Initialize(WarehouseDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Customers.Any())
        {
            return; // DB has been seeded
        }

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = "Acme Fulfillment Corp"
        };
        context.Customers.Add(customer);

        var product1 = new Product
        {
            Id = Guid.NewGuid(),
            SKU = "BOX-HVY-001",
            Name = "Shipping Box - Heavy Duty",
            Price = 4.50m,
            AvailableQuantity = 250
        };
        var product2 = new Product
        {
            Id = Guid.NewGuid(),
            SKU = "TAPE-PAK-002",
            Name = "Packing Tape (3-Pack)",
            Price = 12.99m,
            AvailableQuantity = 180
        };
        var product3 = new Product
        {
            Id = Guid.NewGuid(),
            SKU = "PLT-WDN-003",
            Name = "Standard Wooden Pallet",
            Price = 45.00m,
            AvailableQuantity = 40
        };
        context.Products.AddRange(product1, product2, product3);

        var order1 = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            Status = OrderStatus.Created,
            CreatedAt = DateTime.UtcNow.AddHours(-2),
            QuickBooksInvoiceId = null,
            OrderItems = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product1.Id,
                    Quantity = 10,
                    UnitPrice = product1.Price
                },
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product2.Id,
                    Quantity = 2,
                    UnitPrice = product2.Price
                }
            }
        };

        var order2 = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            Status = OrderStatus.Shipped,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            QuickBooksInvoiceId = null,
            OrderItems = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product3.Id,
                    Quantity = 5,
                    UnitPrice = product3.Price
                },
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product1.Id,
                    Quantity = 20,
                    UnitPrice = product1.Price
                }
            }
        };

        context.Orders.AddRange(order1, order2);
        context.SaveChanges();
    }
}
