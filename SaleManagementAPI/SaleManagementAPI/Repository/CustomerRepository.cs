using Microsoft.Data.SqlClient;
using SaleManagementAPI.Models;

namespace SaleManagementAPI.Repository
{
    public class CustomerRepository
    {
        private readonly string _connStr;
        public CustomerRepository(IConfiguration configuration)
        {
            _connStr = configuration.GetConnectionString("SMSDbConn");
        }
        public List<Customer> GetAllCustomers()
        {
            var Customers = new List<Customer>();
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "SELECT * FROM Customers";
                SqlCommand cmd = new SqlCommand(sql, conn);
                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Customers.Add(new Customer
                        {
                            CustomerID = reader["CustomerID"].ToString(),
                            CustomerName = reader["CustomerName"].ToString(),
                            Phone = reader["Phone"].ToString(),
                        });
                    }
                }
            }
            return Customers;
        }

        public Customer GetCustomerByID(string CustomerID)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "SELECT * FROM Customers WHERE CustomerID = @ID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@ID", CustomerID);
                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new Customer
                        {
                            CustomerID = reader["CustomerID"].ToString(),
                            CustomerName = reader["CustomerName"].ToString(),
                            Phone = reader["Phone"].ToString(),
                        };
                    }
                }
            }
            return null;
        }

        public bool AddNewCustomer(Customer Customer)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "INSERT INTO Customers(CustomerID, CustomerName, Phone) VALUES (@ID, @Name, @Phone)";
                SqlCommand cmd = new SqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("@ID", Customer.CustomerID.Trim().ToUpper());
                cmd.Parameters.AddWithValue("@Name", Customer.CustomerName.Trim());
                cmd.Parameters.AddWithValue("@Phone", Customer.Phone);

                conn.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        public bool UpdateCustomer(Customer Customer)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "UPDATE CUSTOMERS SET CustomerName = @Name, Phone = @Phone WHERE CustomerID = @ID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@ID", Customer.CustomerID);
                cmd.Parameters.AddWithValue("@Name", Customer.CustomerName.Trim());
                cmd.Parameters.AddWithValue("@Phone", Customer.Phone);

                conn.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        public bool IsCustomerInInvoice(string CustomerID)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "SELECT COUNT(1) FROM Invoices WHERE CustomerID = @ID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@ID", CustomerID);
                conn.Open();
                return (int)cmd.ExecuteScalar() > 0;
            }
        }

        public bool DeleteCustomer(string CustomerID)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sql = "DELETE FROM Customers WHERE CustomerID = @ID";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@ID", CustomerID);
                conn.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }
    }
}
