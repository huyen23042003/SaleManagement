using System.ComponentModel.DataAnnotations;

namespace SaleManagementAPI.Models
{
    public class Product
    {
        [Required(ErrorMessage = "Vui lòng nhập mã sản phẩm")]
        public string ProductID { get; set; }
        
        [Required(ErrorMessage = "Vui lòng nhập tên sản phẩm")]
        public string ProductName { get; set; }
       
        [Required(ErrorMessage = "Vui lòng nhập giá sản phẩm")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá sản phẩm phải lớn hơn hoặc bằng 0")]
        public decimal Price { get; set; }

    }
}
