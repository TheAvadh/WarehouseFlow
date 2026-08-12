namespace WarehouseFlow.Backend.Models;

public enum OrderStatus
{
    Created = 0,
    Picking = 1,
    Packed = 2,
    Shipped = 3,
    Invoiced = 4
}
