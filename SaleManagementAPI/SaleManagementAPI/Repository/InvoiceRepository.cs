using Microsoft.Data.SqlClient;
using System.Configuration;
using SaleManagementAPI.Models;
namespace SaleManagementAPI.Repository
{
    public class InvoiceReporitory
    {
        private readonly string _connStr;
        public InvoiceReporitory(IConfiguration configuration)
        {
            _connStr = configuration.GetConnectionString("SMSDbConn");
        }

        public List<Invoice> GetAllInvoices()
        {
            List<Invoice> invoices = new List<Invoice>();
            using (SqlConnection sqlConnection = new SqlConnection(this._connStr))
            {
                String sql = "SELECT * FROM INVOICES";
                sqlConnection.Open();
                SqlCommand cmd = new SqlCommand(sql, sqlConnection);
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        invoices.Add(new Invoice
                        {
                            InvoiceID = reader["InvoiceID"].ToString(),
                            CustomerID = reader["CustomerID"].ToString(),
                            InvoiceDate = Convert.ToDateTime(reader["InvoiceDate"]),
                            TotalPrice = Convert.ToDecimal(reader["TotalPrice"])

                        });
                    }
                }
            }
            return invoices;
        }


        public Invoice GetInvoiceByID(string invoiceID)
        {
            Invoice invoice = null;
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                string sqlInvoiceMaster = "SELECT I.InvoiceID, C.CustomerID, C.CustomerName, I.InvoiceDate, I.TotalPrice " +
                                          "FROM INVOICES AS I JOIN CUSTOMERS AS C ON I.CustomerID = C.CustomerID WHERE I.InvoiceID = @InvoiceID";

                SqlCommand cmd = new SqlCommand(sqlInvoiceMaster, conn);
                cmd.Parameters.AddWithValue("@InvoiceID", (object)invoiceID ?? DBNull.Value);

                conn.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        invoice = new Invoice
                        {
                            InvoiceID = reader["InvoiceID"].ToString(),
                            CustomerID = reader["CustomerID"].ToString(),
                            CustomerName = reader["CustomerName"].ToString(),
                            InvoiceDate = Convert.ToDateTime(reader["InvoiceDate"]),
                            TotalPrice = Convert.ToDecimal(reader["TotalPrice"]),
                            InvoiceDetails = new List<InvoiceDetail>()
                        };
                    }
                }

                if (invoice != null && !string.IsNullOrEmpty(invoice.InvoiceID))
                {
                    string sqlDetail = "SELECT InvD.InvoiceDetailID, InvD.InvoiceID, P.ProductID, P.ProductName, " +
                                       "InvD.Quantity, P.Price, InvD.TotalPrice FROM INVOICEDETAILS AS InvD " +
                                       "JOIN PRODUCTS AS P ON InvD.ProductID = P.ProductID WHERE InvD.InvoiceID = @InvoiceID";

                    SqlCommand cmdInvD = new SqlCommand(sqlDetail, conn);
                    cmdInvD.Parameters.AddWithValue("@InvoiceID", invoice.InvoiceID);

                    using (SqlDataReader reader = cmdInvD.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            invoice.InvoiceDetails.Add(new InvoiceDetail
                            {
                                InvoiceDetailID = reader["InvoiceDetailID"].ToString(),
                                InvoiceID = reader["InvoiceID"].ToString(),
                                ProductID = reader["ProductID"].ToString(),
                                ProductName = reader["ProductName"].ToString(),
                                Price = Convert.ToDecimal(reader["Price"]),
                                Quantity = Convert.ToInt32(reader["Quantity"]),
                                TotalPrice = Convert.ToDecimal(reader["TotalPrice"])
                            });
                        }
                    }
                }
            }
            return invoice;
        }
        public bool AddInvoice(Invoice invoice)
        {
            using (SqlConnection sqlConnection = new SqlConnection(this._connStr))
            {
                sqlConnection.Open();
                using (SqlTransaction transaction = sqlConnection.BeginTransaction())
                {
                    try
                    {
                        string sqlInvoice = "INSERT INTO INVOICES (InvoiceID, CustomerID, InvoiceDate, TotalPrice) VALUES (@InvoiceId, @CustomerID, @InvoiceDate, @TotalPrice)";
                        SqlCommand cmdInv = new SqlCommand(sqlInvoice, sqlConnection, transaction);

                        cmdInv.Parameters.AddWithValue("@InvoiceId", invoice.InvoiceID);
                        cmdInv.Parameters.AddWithValue("@CustomerID", invoice.CustomerID);
                        cmdInv.Parameters.AddWithValue("@InvoiceDate", DateTime.Now);
                        cmdInv.Parameters.AddWithValue("@TotalPrice", invoice.TotalPrice);
                        cmdInv.ExecuteNonQuery();

                        if (invoice.InvoiceDetails != null && invoice.InvoiceDetails.Count > 0)
                        {
                            for (int i = 0; i < invoice.InvoiceDetails.Count; i++)
                            {
                                var det = invoice.InvoiceDetails[i];
                                string autoDetailID = string.Format("{0}_{1}", invoice.InvoiceID, i + 1);

                                string sqlDet = "INSERT INTO INVOICEDETAILS (InvoiceDetailID, InvoiceID, ProductID, Quantity, TotalPrice) " +
                                                "VALUES (@DetID, @InvID, @ProID, @Qty, @LineTotal)";

                                SqlCommand cmdDet = new SqlCommand(sqlDet, sqlConnection, transaction);

                                cmdDet.Parameters.AddWithValue("@DetID", autoDetailID);
                                cmdDet.Parameters.AddWithValue("@InvID", invoice.InvoiceID);
                                cmdDet.Parameters.AddWithValue("@ProID", det.ProductID);
                                cmdDet.Parameters.AddWithValue("@Qty", det.Quantity);
                                cmdDet.Parameters.AddWithValue("@LineTotal", det.TotalPrice);

                                cmdDet.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return false;
                    }
                }
            }
        }

        public bool UpdateInvoice(Invoice invoice)
        {
            using (SqlConnection sqlConnection = new SqlConnection(_connStr))
            {
                sqlConnection.Open();
                using (SqlTransaction transaction = sqlConnection.BeginTransaction())
                {
                    try
                    {
                        string sqlInvoice = string.Format("UPDATE INVOICES " +
                            "SET CustomerID = @CustomerID,InvoiceDate = @InvoiceDate, TotalPrice = @TotalPrice " +
                            "WHERE InvoiceID = @InvoiceID");
                        SqlCommand cmdInv = new SqlCommand(sqlInvoice, sqlConnection, transaction);
                        cmdInv.Parameters.AddWithValue("@InvoiceID", invoice.InvoiceID);
                        cmdInv.Parameters.AddWithValue("@CustomerID", invoice.CustomerID);
                        cmdInv.Parameters.AddWithValue("@InvoiceDate", invoice.InvoiceDate);
                        cmdInv.Parameters.AddWithValue("@TotalPrice", invoice.TotalPrice);
                        cmdInv.ExecuteNonQuery();

                        string sqlDelInvD = "DELETE FROM INVOICEDETAILS WHERE InvoiceID = @InvoiceID";
                        SqlCommand cmdDelInvD = new SqlCommand(sqlDelInvD, sqlConnection, transaction);
                        cmdDelInvD.Parameters.AddWithValue("@InvoiceID", invoice.InvoiceID);
                        cmdDelInvD.ExecuteNonQuery();

                        if (invoice.InvoiceDetails != null && invoice.InvoiceDetails.Count > 0)
                        {
                            for (int i = 0; i < invoice.InvoiceDetails.Count; i++)
                            {
                                var det = invoice.InvoiceDetails[i];
                                string autoDetailID = string.Format("{0}_{1}", invoice.InvoiceID, i + 1);

                                string sqlDet = "INSERT INTO INVOICEDETAILS (InvoiceDetailID, InvoiceID, ProductID, Quantity, TotalPrice) " +
                                                "VALUES (@DetID, @InvID, @ProID, @Qty, @LineTotal)";

                                SqlCommand cmdInvD = new SqlCommand(sqlDet, sqlConnection, transaction);

                                cmdInvD.Parameters.AddWithValue("@DetID", autoDetailID);
                                cmdInvD.Parameters.AddWithValue("@InvID", invoice.InvoiceID);
                                cmdInvD.Parameters.AddWithValue("@ProID", det.ProductID);
                                cmdInvD.Parameters.AddWithValue("@Qty", det.Quantity);
                                cmdInvD.Parameters.AddWithValue("@LineTotal", det.TotalPrice);

                                cmdInvD.ExecuteNonQuery();
                            }
                        }


                        transaction.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        System.Diagnostics.Debug.WriteLine("SQL Error: " + ex.Message);
                        return false;
                    }
                }
            }
        }
        public bool DeleteInvoice(string invoiceID)
        {
            using (SqlConnection sqlConnection = new SqlConnection(_connStr))
            {
                sqlConnection.Open();
                using (SqlTransaction transaction = sqlConnection.BeginTransaction())
                {
                    try
                    {
                        string sqlInvoiceDetail = "DELETE FROM INVOICEDETAILS WHERE InvoiceID = @InvoiceID";
                        SqlCommand cmdInvD = new SqlCommand(sqlInvoiceDetail, sqlConnection, transaction);
                        cmdInvD.Parameters.AddWithValue("@InvoiceID", invoiceID);
                        cmdInvD.ExecuteNonQuery();

                        string sqlInvoice = "DELETE FROM INVOICES WHERE InvoiceID = @InvoiceID";
                        SqlCommand cmdInv = new SqlCommand(sqlInvoice, sqlConnection, transaction);
                        cmdInv.Parameters.AddWithValue("@InvoiceID", invoiceID);
                        cmdInv.ExecuteNonQuery();

                        transaction.Commit();
                        return true;
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        return false;
                    }
                }
            }
        }
    }
}
