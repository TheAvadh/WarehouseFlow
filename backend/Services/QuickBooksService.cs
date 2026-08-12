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
        // 1. Idempotency Check
        if (!string.IsNullOrEmpty(order.QuickBooksInvoiceId))
        {
            return order.QuickBooksInvoiceId;
        }

        // 2. Fetch fresh Access Token
        string accessToken = await GetFreshAccessTokenAsync();

        string baseUrl = string.IsNullOrWhiteSpace(_settings.BaseUrl)
            ? "https://sandbox-quickbooks.api.intuit.com"
            : _settings.BaseUrl.TrimEnd('/');

        // 3. Dynamic Customer Sync: Find or create customer in QuickBooks
        string customerName = order.Customer?.Name ?? "Acme Fulfillment Corp";
        string qboCustomerId = await GetOrCreateCustomerIdAsync(customerName, accessToken, baseUrl, _settings.RealmId);

        string docNumber = $"WF-ORD-{order.Id.ToString()[..8].ToUpper()}";

        // 4. Build QuickBooks Invoice Payload with dynamic CustomerRef
        var invoicePayload = new
        {
            DocNumber = docNumber,
            Line = order.OrderItems.Select(item => new
            {
                Amount = item.Quantity * item.UnitPrice,
                Description = $"{item.Product?.Name ?? "Warehouse Item"} (SKU: {item.Product?.SKU ?? "N/A"})",
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
                value = qboCustomerId
            }
        };

        string requestUrl = $"{baseUrl}/v3/company/{_settings.RealmId}/invoice?minorversion=65";

        // 5. Send Invoice Request
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

        // 6. Extract Internal Invoice ID for Deep Link
        var jsonResponse = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(jsonResponse);

        string internalInvoiceId = jsonDoc.RootElement
            .GetProperty("Invoice")
            .GetProperty("Id")
            .GetString() ?? throw new InvalidOperationException("Failed to parse Invoice ID.");

        order.QuickBooksInvoiceId = internalInvoiceId;
        await _context.SaveChangesAsync();

        return internalInvoiceId;
    }

    /// <summary>
    /// Looks up a customer in QuickBooks by name. If not found, creates a new Customer record dynamically.
    /// </summary>
    private async Task<string> GetOrCreateCustomerIdAsync(string customerName, string accessToken, string baseUrl, string realmId)
    {
        try
        {
            // Escape single quotes for QuickBooks SQL query
            string sanitizedName = customerName.Replace("'", "''");
            string query = $"select Id from Customer where DisplayName = '{sanitizedName}'";
            string queryUrl = $"{baseUrl}/v3/company/{realmId}/query?query={Uri.EscapeDataString(query)}&minorversion=65";

            using var queryRequest = new HttpRequestMessage(HttpMethod.Get, queryUrl);
            queryRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            queryRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var queryResponse = await _httpClient.SendAsync(queryRequest);

            if (queryResponse.IsSuccessStatusCode)
            {
                var queryJson = await queryResponse.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(queryJson);

                if (doc.RootElement.TryGetProperty("QueryResponse", out var queryResp) &&
                    queryResp.TryGetProperty("Customer", out var customers) &&
                    customers.ValueKind == JsonValueKind.Array &&
                    customers.GetArrayLength() > 0)
                {
                    return customers[0].GetProperty("Id").GetString() ?? "1";
                }
            }

            // Customer not found -> Create Customer in QuickBooks
            string createUrl = $"{baseUrl}/v3/company/{realmId}/customer?minorversion=65";
            using var createRequest = new HttpRequestMessage(HttpMethod.Post, createUrl);
            createRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            createRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var createPayload = new { DisplayName = customerName };
            createRequest.Content = new StringContent(JsonSerializer.Serialize(createPayload), Encoding.UTF8, "application/json");

            var createResponse = await _httpClient.SendAsync(createRequest);
            if (createResponse.IsSuccessStatusCode)
            {
                var createJson = await createResponse.Content.ReadAsStringAsync();
                using var createDoc = JsonDocument.Parse(createJson);
                if (createDoc.RootElement.TryGetProperty("Customer", out var newCust) &&
                    newCust.TryGetProperty("Id", out var newId))
                {
                    return newId.GetString() ?? "1";
                }
            }
        }
        catch
        {
            // Fallback to default Sandbox Customer ID ("1") if lookup/creation encounters an issue
        }

        return "1";
    }

    private async Task<string> GetFreshAccessTokenAsync()
    {
        var tokenEndpoint = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
        using var request = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint);

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