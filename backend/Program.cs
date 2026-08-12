using Microsoft.EntityFrameworkCore;
using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Ensure the application listens on http://localhost:5000
builder.WebHost.UseUrls("http://localhost:5000");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite DbContext
builder.Services.AddDbContext<WarehouseDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=warehouseflow.db"));

// Register QuickBooks Integration Service
builder.Services.AddScoped<IQuickBooksService, QuickBooksService>();

// Global CORS policy allowing any origin, header, and method
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Auto-create database and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<WarehouseDbContext>();
    DbInitializer.Initialize(dbContext);
}

// Enable Swagger UI in development and production for easy API testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WarehouseFlow API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
