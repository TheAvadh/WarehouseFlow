using Microsoft.EntityFrameworkCore;
using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Services;
using WarehouseFlow.Backend.Models;

var builder = WebApplication.CreateBuilder(args);

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

// Bind QuickBooks Settings from appsettings or Environment Variables
builder.Services.Configure<QuickBooksSettings>(builder.Configuration.GetSection("QuickBooks"));

// Register QuickBooksService as a Typed HttpClient Service
builder.Services.AddHttpClient<IQuickBooksService, QuickBooksService>();

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
// Enable Swagger UI in ALL environments (including Production on Render)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WarehouseFlow API v1");
    // Serving Swagger at the root URL (https://warehouseflow-10jo.onrender.com/)
    c.RoutePrefix = string.Empty;
});

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();