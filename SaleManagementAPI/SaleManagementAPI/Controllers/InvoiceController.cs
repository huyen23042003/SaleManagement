using Microsoft.AspNetCore.Mvc;
using SaleManagementAPI.Models;
using SaleManagementAPI.Repository;

namespace SaleManagementAPI.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly InvoiceReporitory _invoiceRepository;
        private readonly CustomerRepository _customerRepository;
        private readonly ProductRepository _productRepository;
        public InvoiceController(InvoiceReporitory invoiceReporitory,
                                 CustomerRepository customerRepository,
                                 ProductRepository productRepository)
        {
            _invoiceRepository = invoiceReporitory;
            _customerRepository = customerRepository;
            _productRepository = productRepository;
        }
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_invoiceRepository.GetAllInvoices());
        }
        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            Invoice invoice = _invoiceRepository.GetInvoiceByID(id);
            if (invoice != null)
            {
                return Ok(invoice);
            }
            return NotFound();
        }
        [HttpPost]
        public IActionResult Create([FromBody] Invoice invoice)
        {
            invoice.InvoiceID = invoice.InvoiceID.Trim().ToUpper();
            if (invoice == null)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }
            if (string.IsNullOrEmpty(invoice.InvoiceID) ||
                string.IsNullOrEmpty(invoice.CustomerID))
            {
                return BadRequest("Vui lòng nhập đầy đủ thông tin");
            }
            if (_invoiceRepository.GetInvoiceByID(invoice.InvoiceID) != null)
            {
                return BadRequest("Mã hóa đơn đã tồn tại");
            }
            if (invoice.InvoiceDetails.Count == 0 || invoice.InvoiceDetails == null)
            {
                return BadRequest("Hóa đơn cần có ít nhất 1 sản phẩm");
            }
            if (_customerRepository.GetCustomerByID(invoice.CustomerID) == null)
            {
                return BadRequest("Khách hàng này không tồn tại");
            }
            foreach (var invoiceDetail in invoice.InvoiceDetails)
            {
                if (invoiceDetail.Quantity <= 0)
                {
                    return BadRequest("Số lượng sản phẩm phải lớn hơn 0");
                }
                if (_productRepository.GetProductByID(invoiceDetail.ProductID) == null)
                {
                    return BadRequest("Sản phẩm này không tồn tại");
                }
            }
            try
            {
                if (_invoiceRepository.AddInvoice(invoice))
                {
                    return Ok("Thêm hóa đơn thành công");
                }
                else
                {
                    return BadRequest("Thêm thất bại, có lỗi xảy ra.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult Edit(string id, [FromBody] Invoice invoice)
        {
            id = id.Trim().ToUpper();
            if (_invoiceRepository.GetInvoiceByID(id) == null)
            {
                return NotFound();
            }
            invoice.InvoiceID = invoice.InvoiceID.Trim().ToUpper();
            if (!id.Equals(invoice.InvoiceID))
            {
                return BadRequest("Không được thay đổi mã hóa đơn");
            }
            if (invoice == null)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }
            if (string.IsNullOrEmpty(invoice.InvoiceID) ||
                string.IsNullOrEmpty(invoice.CustomerID))
            {
                return BadRequest("Vui lòng nhập đầy đủ thông tin");
            }
            if (invoice.InvoiceDetails.Count == 0 || invoice.InvoiceDetails == null)
            {
                return BadRequest("Hóa đơn cần có ít nhất 1 sản phẩm");
            }
            if (_customerRepository.GetCustomerByID(invoice.CustomerID) == null)
            {
                return BadRequest("Khách hàng này không tồn tại");
            }
            foreach (var invoiceDetail in invoice.InvoiceDetails)
            {
                if (_productRepository.GetProductByID(invoiceDetail.ProductID) == null)
                {
                    return BadRequest("Sản phẩm này không tồn tại");
                }
                if (invoiceDetail.Quantity <= 0)
                {
                    return BadRequest("Số lượng sản phẩm phải lớn hơn 0");
                }
                
            }
            try
            {
                if (_invoiceRepository.UpdateInvoice(invoice))
                {
                    return Ok("Cập nhật hóa đơn thành công");
                }
                else
                {
                    return BadRequest("Cập nhật hóa đơn thất bại, có lỗi xảy ra.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            id = id.Trim().ToUpper();
            if (_invoiceRepository.GetInvoiceByID(id) == null)
            {
                return NotFound();
            }
            if (_invoiceRepository.DeleteInvoice(id))
            {
                return Ok(new { message= "Xóa thành công" });
            }
            else
            {
                return BadRequest("Xóa thất bại");
            }
        }
        
    }
}
