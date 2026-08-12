namespace WarehouseFlow.Backend.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SKU { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int AvailableQuantity { get; set; }
}
