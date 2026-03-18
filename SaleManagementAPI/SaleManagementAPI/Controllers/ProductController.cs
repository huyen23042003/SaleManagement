using Microsoft.AspNetCore.Mvc;
using SaleManagementAPI.Models;
using SaleManagementAPI.Repository;

namespace SaleManagementAPI.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ProductRepository _productRepository;

        public ProductController(ProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_productRepository.GetAllProducts());

        [HttpPost]
        public IActionResult Create([FromBody] Product product)
        {
            product.ProductID = product.ProductID.ToUpper().Trim();
            if (string.IsNullOrEmpty(product.ProductID) ||
                string.IsNullOrEmpty(product.ProductName))
            {
                return BadRequest("Vui lòng nhập đầy đủ thông tin.");
            }
            if (product.Price <= 0)
            {
                return BadRequest("Vui lòng nhập giá sản phẩm lớn hơn 0");
            }

            if (_productRepository.GetProductByID(product.ProductID) != null)
            {
                return BadRequest("Mã sản phẩm đã tồn tại");
            }
            if (_productRepository.AddProduct(product))
            {
                return Ok(new { message = "Thêm thành công" });
            }
            return StatusCode(500, "Lỗi lưu dữ liệu");

        }

        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            Product product = _productRepository.GetProductByID(id);
            if(product != null)
            {
                return Ok(product);
            }
            return NotFound();
             
        }
        [HttpPut("{id}")]
        public IActionResult Edit(string id, [FromBody] Product product)
        {
            if(product == null)
            {
                return BadRequest("Dữ liệu không hợp lệ");
            }
            if(_productRepository.GetProductByID(id) == null)
            {
                return BadRequest("Sản phẩm không tồn tại");
            }
            if (string.IsNullOrWhiteSpace(product.ProductName))
            {
                return BadRequest("Tên sản phẩm không được để trống.");
            }

            if (product.Price <= 0)
            {
                return BadRequest("Giá sản phẩm phải lớn hơn 0.");
            }

            id = id.ToUpper().Trim();
            product.ProductID = product.ProductID.Trim().ToUpper();
            if (!id.Equals(product.ProductID))
            {
                return BadRequest("Không được đổi mã sản phẩm");
            }

            try
            {
                if (_productRepository.UpdateProduct(product))
                {
                    return Ok(new { message = "Cập nhật sản phẩm thành công" });
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
            if (_productRepository.IsProductInInvoice(id))
            {
                return BadRequest("Sản phẩm đang nằm trong hóa đơn, không thể xóa");
            }
            if (_productRepository.DeleteProduct(id))
            {
                return Ok(new { message = "Xóa thành công" });
            }
            return NotFound();
        }


    }


}
