namespace WarehouseFlow.Backend.Dtos;

public class DashboardDto
{
    public int TotalOrders { get; set; }
    public int Picking { get; set; }
    public int Packed { get; set; }
    public int Shipped { get; set; }
    public int Invoiced { get; set; }
    public int TotalProducts { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductSKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
}

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int StatusInt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? QuickBooksInvoiceId { get; set; }
    public decimal TotalAmount { get; set; }
    public int TotalItems { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreateOrderDto
{
    public Guid CustomerId { get; set; }
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CustomerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateCustomerDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateCustomerDto
{
    public string Name { get; set; } = string.Empty;
}

public class ProductDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int AvailableQuantity { get; set; }
}

public class CreateProductDto
{
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int AvailableQuantity { get; set; }
}

public class UpdateProductDto
{
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int AvailableQuantity { get; set; }
}
