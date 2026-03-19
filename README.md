# SaleManagement

Bài tập quản lý doanh thu bán hàng gồm hai phần: Front-end (Expo + React Native) và Back-end API (ASP.Net Core Web API).

**Mô tả ngắn:**
- Front-end: ứng dụng di động đơn giản để quản lý Khách hàng, Sản phẩm và Hóa đơn.
- API: dịch vụ REST dùng SQL Server để lưu trữ dữ liệu (Customers, Products, Invoices, InvoiceDetails).

**Cấu trúc chính**
- Front-end: [Front-end/README.md](Front-end/README.md)
	- Cấu hình, thư viện chính: [Front-end/package.json](Front-end/package.json)
	- Trang chính (routing): [Front-end/app/_layout.tsx](Front-end/app/_layout.tsx)
	- Tabs: [Front-end/app/(tabs)/customer.tsx](Front-end/app/(tabs)/customer.tsx), [Front-end/app/(tabs)/product.tsx](Front-end/app/(tabs)/product.tsx), [Front-end/app/(tabs)/invoice.tsx](Front-end/app/(tabs)/invoice.tsx)
	- Theme & UI helpers: [Front-end/constants/theme.ts](Front-end/constants/theme.ts), [Front-end/components/ui/collapsible.tsx](Front-end/components/ui/collapsible.tsx)

- API: [SaleManagementAPI/SaleManagementAPI/SaleManagementAPI.csproj](SaleManagementAPI/SaleManagementAPI/SaleManagementAPI.csproj)
	- Entry: [SaleManagementAPI/SaleManagementAPI/Program.cs](SaleManagementAPI/SaleManagementAPI/Program.cs)
	- Controllers: [SaleManagementAPI/SaleManagementAPI/Controllers/CustomerController.cs](SaleManagementAPI/SaleManagementAPI/Controllers/CustomerController.cs), [SaleManagementAPI/SaleManagementAPI/Controllers/ProductController.cs](SaleManagementAPI/SaleManagementAPI/Controllers/ProductController.cs), [SaleManagementAPI/SaleManagementAPI/Controllers/InvoiceController.cs](SaleManagementAPI/SaleManagementAPI/Controllers/InvoiceController.cs)
	- Repository access DB: [SaleManagementAPI/SaleManagementAPI/Repository/CustomerRepository.cs](SaleManagementAPI/SaleManagementAPI/Repository/CustomerRepository.cs), [SaleManagementAPI/SaleManagementAPI/Repository/ProductRepository.cs](SaleManagementAPI/SaleManagementAPI/Repository/ProductRepository.cs), [SaleManagementAPI/SaleManagementAPI/Repository/InvoiceRepository.cs](SaleManagementAPI/SaleManagementAPI/Repository/InvoiceRepository.cs)

**API - tóm tắt endpoint chính**
- Customer: `GET /api/Customer`, `GET /api/Customer/{id}`, `POST /api/Customer`, `PUT /api/Customer/{id}`, `DELETE /api/Customer/{id}`
- Product: `GET /api/Product`, `GET /api/Product/{id}`, `POST /api/Product`, `PUT /api/Product/{id}`, `DELETE /api/Product/{id}`
- Invoice: `GET /api/Invoice`, `GET /api/Invoice/{id}`, `POST /api/Invoice`, `PUT /api/Invoice/{id}`, `DELETE /api/Invoice/{id}`

Các controller có validate cơ bản (kiểm tra trường bắt buộc, không cho đổi ID, và kiểm tra tham chiếu khi xóa).

**Cơ sở dữ liệu**
- API dùng connection string với key `SMSDbConn` (xem `appsettings.json` trong thư mục API). Cần SQL Server với các bảng: `Customers`, `Products`, `INVOICES`, `INVOICEDETAILS`.

**Chạy project**
- Front-end (cài dependency, chạy expo):
```bash
cd Front-end
npm install
npx expo start
```

- API (.NET 8):
```bash
cd SaleManagementAPI/SaleManagementAPI
dotnet restore
dotnet run
# API mặc định lắng nghe trên http://localhost:5046
```

