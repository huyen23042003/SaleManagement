namespace SaleManagementAPI.Models
{
    public class InvoiceDetail
    {
        public string? InvoiceDetailID { get; set; }
        public string? InvoiceID { get; set; }

        public string? ProductID { get; set; }

        public string? ProductName { get; set; }

        public int Quantity { get; set; }

        public decimal? Price { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
