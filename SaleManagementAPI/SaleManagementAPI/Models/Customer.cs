using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace SaleManagementAPI.Models
{
    public class Customer
    {
        public string CustomerID { get; set; }

        public string CustomerName { get; set; }

        [RegularExpression(@"^[0-9]*$", ErrorMessage = "Số điện thoại chỉ được nhập số")]
        [StringLength(10, MinimumLength = (9), ErrorMessage = "Số điện thoại tối thiểu ")]
        public string Phone { get; set; }
    }
}
