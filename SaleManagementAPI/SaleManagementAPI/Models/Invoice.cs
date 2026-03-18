namespace SaleManagementAPI.Models
{
    public class Invoice
    {
        public string InvoiceID { get; set; }

        public string? CustomerID { get; set; }

        public string? CustomerName { get; set; }

        public DateTime InvoiceDate { get; set; } = DateTime.Now;

        public decimal TotalPrice { get; set; }

        public List<InvoiceDetail> InvoiceDetails { get; set; } = new List<InvoiceDetail>();

        public Invoice()
        {
            InvoiceDetails = new List<InvoiceDetail>();
        }
    }
}
