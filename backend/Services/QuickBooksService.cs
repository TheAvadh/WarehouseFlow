using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using WarehouseFlow.Backend.Data;
using WarehouseFlow.Backend.Models;

namespace WarehouseFlow.Backend.Services;

public class QuickBooksService : IQuickBooksService
{
    private readonly WarehouseDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly QuickBooksSettings _settings;

    public QuickBooksService(
        WarehouseDbContext context,
        HttpClient httpClient,
        IOptions<QuickBooksSettings> settings)
    {
        _context = context;
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public async Task<string> GenerateInvoiceAsync(Order order)
    {
        // 1. Idempotency Check: Don't recreate if invoice already exists
        if (!string.IsNullOrEmpty(order.QuickBooksInvoiceId))
        {
            return order.QuickBooksInvoiceId;
        }

        // 2. Fetch a fresh Access Token using the 100-day Refresh Token
        string accessToken = await GetFreshAccessTokenAsync();

        string docNumber = $"WF-ORD-{order.Id.ToString()[..8].ToUpper()}";

        // 3. Build QuickBooks Invoice Payload
        var invoicePayload = new
        {
            DocNumber = docNumber,
            Line = order.OrderItems.Select(item => new
            {
                Amount = item.Quantity * item.UnitPrice,
                DetailType = "SalesItemLineDetail",
                SalesItemLineDetail = new
                {
                    Qty = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    ItemRef = new
                    {
                        value = "1",
                        name = "Services"
                    }
                }
            }).ToArray(),
            CustomerRef = new
            {
                value = "1" // Default Sandbox Customer
            }
        };

        // 4. Send Invoice Creation Request
        var requestUrl = $"{_settings.BaseUrl}/v3/company/{_settings.RealmId}/invoice?minorversion=65";
        using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Content = new StringContent(JsonSerializer.Serialize(invoicePayload), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"QuickBooks API call failed [{response.StatusCode}]: {errorBody}");
        }

        // 5. Extract Invoice ID from Response
        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(jsonResponse);

        string invoiceId = jsonDoc.RootElement
            .GetProperty("Invoice")
            .GetProperty("Id")
            .GetString() ?? throw new InvalidOperationException("Failed to parse Invoice ID.");

        // 6. Save Invoice ID to SQLite Database
        order.QuickBooksInvoiceId = invoiceId;
        await _context.SaveChangesAsync();

        return invoiceId;
    }

    /// <summary>
    /// Uses the long-lived Refresh Token to request a fresh 1-hour Access Token from Intuit OAuth server.
    /// </summary>
    private async Task<string> GetFreshAccessTokenAsync()
    {
        var tokenEndpoint = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
        using var request = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint);

        // Basic Auth Header: Base64(ClientId:ClientSecret)
        var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.ClientSecret}"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeader);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var postData = new Dictionary<string, string>
        {
            { "grant_type", "refresh_token" },
            { "refresh_token", _settings.RefreshToken }
        };

        request.Content = new FormUrlEncodedContent(postData);

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Failed to refresh QuickBooks token [{response.StatusCode}]: {errorBody}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(jsonResponse);

        return jsonDoc.RootElement.GetProperty("access_token").GetString()
            ?? throw new InvalidOperationException("Access token was null in OAuth response.");
    }
}