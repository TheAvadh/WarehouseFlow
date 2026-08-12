using Microsoft.EntityFrameworkCore;
using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Data;

public class WarehouseDbContext : DbContext
{
    public WarehouseDbContext(DbContextOptions<WarehouseDbContext> options) : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasConversion<double>();

        modelBuilder.Entity<OrderItem>()
            .Property(i => i.UnitPrice)
            .HasConversion<double>();

        modelBuilder.Entity<Order>()
            .Property(o => o.Status)
            .HasConversion<int>();
    }
}
