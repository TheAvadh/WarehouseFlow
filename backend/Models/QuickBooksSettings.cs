namespace WarehouseFlow.Backend.Models;

public class QuickBooksSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RealmId { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://sandbox-quickbooks.api.intuit.com";
}