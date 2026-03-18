using Microsoft.AspNetCore.Mvc;
using SaleManagementAPI.Models;
using SaleManagementAPI.Repository;

namespace SaleManagementAPI.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly CustomerRepository _customerRepository;

        public CustomerController(CustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }
       
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_customerRepository.GetAllCustomers());
        }
        [HttpPost]
        public IActionResult Create([FromBody] Customer customer)
        {
            if(customer == null)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }
            if (string.IsNullOrEmpty(customer.CustomerID) ||
                string.IsNullOrEmpty(customer.CustomerName)||
                string.IsNullOrEmpty(customer.Phone))
            {
                return BadRequest("Vui lòng nhập đầy đủ thông tin.");
            }

            if (_customerRepository.GetCustomerByID(customer.CustomerID) != null)
            {
                return BadRequest("Mã khách hàng đã tồn tại");
            }
            if (_customerRepository.AddNewCustomer(customer))
            {
                return Ok(new { message = "Thêm thành công" });
            }
            return StatusCode(500, "Lỗi lưu dữ liệu");
        }

        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            var customer = _customerRepository.GetCustomerByID(id);
            if ( customer!= null)
            {
                return Ok(customer);
            }
            return NotFound();
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] Customer customer)
        {
            if (customer == null)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }
            if (_customerRepository.GetCustomerByID(id) == null)
            {
                return BadRequest("Khách hàng không tồn tại");
            }
            if (string.IsNullOrWhiteSpace(customer.CustomerName))
            {
                return BadRequest("Tên khách hàng không được để trống.");
            }


            id = id.ToUpper().Trim();
            customer.CustomerID = customer.CustomerID.Trim().ToUpper();
            if (!id.Equals(customer.CustomerID))
            {
                return BadRequest("Không được đổi mã khách hàng");
            }

            try
            {
                if (_customerRepository.UpdateCustomer(customer))
                {
                    return Ok(new { message = "Cập nhật khách hàng thành công" });
                }
                return StatusCode(500, "Lỗi trong quá trình cập nhật dữ liệu.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            if (_customerRepository.IsCustomerInInvoice(id))
            {
                return BadRequest("Sản phẩm đang nằm trong hóa đơn, không thể xóa");
            }
            if (_customerRepository.DeleteCustomer(id))
            {
                return Ok(new { message = "Xóa thành công" });
            }
            return NotFound();
        }

    }
}
