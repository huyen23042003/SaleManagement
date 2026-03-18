using Microsoft.Data.SqlClient;
using System.Configuration;
using SaleManagementAPI.Models;

namespace SaleManagementAPI.Repository
{
    public class ProductRepository
    {
        private readonly string _connStr;

        public ProductRepository(IConfiguration configuration)
        {
            _connStr = configuration.GetConnectionString("SMSDbConn");
        }

        public List<Product> GetAllProducts()
        {
            var products = new List<Product>();
            using (SqlConnection conn = new SqlConnection(this._connStr))
            {
                string query = "SELECT ProductId, ProductName, Price FROM PRODUCTS";
                SqlCommand cmd = new SqlCommand(query, conn);
                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        products.Add(new Product
                        {
                            ProductID = reader["ProductID"].ToString(),
                            ProductName = reader["ProductName"].ToString(),
                            Price = Convert.ToDecimal(reader["Price"])
                        });
                    }
                }
            }
            return products;
        }

        public bool AddProduct(Product product)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                conn.Open();
                string query = "INSERT INTO PRODUCTS(ProductID, ProductName, Price) VALUES(@ProductID, @ProductName, @Price)";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@ProductID", product.ProductID);
                cmd.Parameters.AddWithValue("@ProductName", product.ProductName);
                cmd.Parameters.AddWithValue("@Price", product.Price);

                int i = cmd.ExecuteNonQuery();

                return i > 0;
            }
        }

        public Product GetProductByID(string productID)
        {
            Product product = null;
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string query = "SELECT ProductID, ProductName, Price FROM PRODUCTS WHERE ProductID = @ProductID";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@ProductID", productID);
                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        product = new Product
                        {
                            ProductID = reader["ProductID"].ToString(),
                            ProductName = reader["ProductName"].ToString(),
                            Price = Convert.ToDecimal(reader["Price"]),
                        };
                    }
                }
                return product;
            }
        }

        public bool UpdateProduct(Product product)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "UPDATE Products SET ProductName = @Name, Price = @Price WHERE ProductID = @ID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@ID", product.ProductID);
                cmd.Parameters.AddWithValue("@Name", product.ProductName.Trim());
                cmd.Parameters.AddWithValue("@Price", product.Price);

                conn.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        public bool IsProductInInvoice(string productID)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "SELECT COUNT(1) FROM InvoiceDetails WHERE ProductID = @ID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@ID", productID);
                conn.Open();
                int i = Convert.ToInt16(cmd.ExecuteScalar());
                return i > 0;
            }
        }

        public bool DeleteProduct(string productID)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "DELETE FROM Products WHERE ProductID = @ID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@ID", productID);
                conn.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }


    }
}
