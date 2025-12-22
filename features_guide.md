# 🌾 Hướng dẫn Tính năng AgriChain

AgriChain là một nền tảng chuỗi cung ứng nông nghiệp dựa trên blockchain, được thiết kế để đảm bảo tính minh bạch, bảo mật và hiệu quả từ trang trại đến người tiêu dùng.

## 🚀 Các Tính năng Chính

### 1. Vòng đời Chuỗi cung ứng (Supply Chain Lifecycle)
Hệ thống quản lý toàn bộ vòng đời của sản phẩm nông nghiệp qua các giai đoạn:
- **Sản xuất (Produce)**: Nông dân tạo sản phẩm mới với mã định danh duy nhất và lưu trữ thông tin trên IPFS.
- **Rao bán (For Sale)**: Niêm yết sản phẩm với giá cụ thể.
- **Mua hàng (Purchase)**: Nhà phân phối, nhà bán lẻ hoặc người tiêu dùng mua sản phẩm.
- **Vận chuyển (Shipped)**: Xác nhận việc gửi hàng.
- **Nhận hàng (Received)**: Xác nhận đã nhận hàng thành công.
- **Chế biến & Đóng gói (Processed & Packaged)**: Nhà phân phối có thể chế biến (ví dụ: cắt lát) và đóng gói lại sản phẩm trước khi bán tiếp.

### 2. Kiểm soát Truy cập theo Vai trò (RBAC)
Dự án sử dụng mô hình phân quyền nghiêm ngặt để đảm bảo đúng người thực hiện đúng việc:
- **Farmer (Nông dân)**: Sản xuất, niêm yết và vận chuyển sản phẩm thô.
- **Distributor (Nhà phân phối)**: Mua từ nông dân, chế biến, đóng gói và bán cho nhà bán lẻ.
- **Retailer (Nhà bán lẻ)**: Mua từ nhà phân phối và bán cho người tiêu dùng cuối cùng.
- **Consumer (Người tiêu dùng)**: Mua sản phẩm cuối cùng và có thể đánh giá chất lượng.
- **Admin/Arbitrator (Quản trị viên/Trọng tài)**: Quản lý hệ thống, xác minh người dùng và giải quyết tranh chấp.

### 3. Hệ thống Ký quỹ & Giải quyết Tranh chấp (Escrow & Dispute Resolution)
Đảm bảo an toàn tài chính cho mọi giao dịch:
- **Ký quỹ tự động**: Tiền thanh toán được giữ trong hợp đồng Escrow cho đến khi người mua xác nhận đã nhận hàng.
- **Mở tranh chấp**: Nếu có vấn đề về chất lượng hoặc vận chuyển, các bên có thể mở tranh chấp.
- **Trọng tài**: Quản trị viên đóng vai trò trọng tài để quyết định hoàn tiền cho người mua, thanh toán cho người bán hoặc chia đôi số tiền.

### 4. Hệ thống Danh tiếng (Reputation System)
Xây dựng niềm tin trong mạng lưới:
- **Đánh giá & Nhận xét**: Người dùng có thể đánh giá lẫn nhau sau mỗi giao dịch (1-5 sao).
- **Điểm số danh tiếng**: Tự động cập nhật dựa trên lịch sử giao dịch thành công/thất bại và các đánh giá đã được xác minh.
- **Cấp độ danh tiếng**: Phân loại người dùng từ "Rất kém" đến "Xuất sắc".

### 5. Quản lý Chất lượng & Hạn sử dụng
- **Theo dõi hạn vận chuyển**: Đặt thời hạn cho việc giao hàng. Nếu quá hạn, người mua có thể yêu cầu hoàn tiền.
- **Thông tin IPFS**: Lưu trữ chứng chỉ chất lượng, hình ảnh và thông tin chi tiết sản phẩm một cách phi tập trung.

---

## 📖 Hướng dẫn Sử dụng

### Bước 1: Thiết lập Môi trường
1. Cài đặt MetaMask và thêm mạng **Polygon Amoy** hoặc sử dụng mạng **Localhost**.
2. Đảm bảo bạn có một ít MATIC thử nghiệm (Faucet tại [Polygon Faucet](https://faucet.polygon.technology/)).

### Bước 2: Cấp quyền Vai trò (Dành cho Admin)
Truy cập trang **Admin** trên ứng dụng để:
1. Gán vai trò (Farmer, Distributor, v.v.) cho các địa chỉ ví tương ứng.
2. Xác minh người dùng (Verify User) để họ có thể thực hiện các thao tác trên chuỗi.

### Bước 3: Thực hiện Quy trình Chuỗi cung ứng

#### 👨‍🌾 Vai trò Nông dân (Farmer Role)
Nông dân là khởi đầu của chuỗi cung ứng. Các chức năng chính bao gồm:

1.  **Sản xuất Sản phẩm (Produce Item)**:
    - Nông dân tạo một lô hàng mới trên hệ thống.
    - Cần cung cấp: Tên sản phẩm, Mô tả, mã IPFS (chứa hình ảnh/chứng chỉ), Giá khởi điểm và Hạn vận chuyển.
    - **Điều kiện**: Nông dân phải được Admin xác minh (Verified) trước khi có thể sản xuất.

2.  **Rao bán Sản phẩm (Sell Item)**:
    - Sau khi sản xuất, nông dân có thể cập nhật giá và đưa sản phẩm lên thị trường để các Nhà phân phối có thể tìm thấy và mua.

3.  **Vận chuyển (Ship Item)**:
    - Sau khi Nhà phân phối đã thanh toán (tiền được giữ trong Escrow), nông dân thực hiện gửi hàng và cập nhật trạng thái "Shipped" trên hệ thống.

#### 💰 Quy tắc Kiểm tra Giá (Price Validation)
Hệ thống áp dụng các quy tắc kiểm tra giá nghiêm ngặt để đảm bảo tính hợp lý:

- **Giới hạn Hợp đồng (Smart Contract Level)**:
    - **Giá tối thiểu (Min Price)**: 0.001 ETH.
    - **Giá tối đa (Max Price)**: 1000 ETH.
    - Bất kỳ giao dịch nào có giá nằm ngoài khoảng này sẽ bị hợp đồng từ chối (Revert).
- **Kiểm tra Giao diện (Frontend Level)**:
    - Form nhập liệu có thuộc tính `min="0.001"` và `max="1000"` để ngăn chặn nhập sai ngay từ đầu.
    - Hệ thống tự động chuyển đổi từ đơn vị ETH sang Wei trước khi gửi lên Blockchain.

---

### Bước 4: Các Vai trò khác
1. **Nhà phân phối**: Chuyển sang ví Distributor -> Tìm sản phẩm -> "Purchase" -> Sau khi nhận hàng, chọn "Receive" -> "Process" -> "Package" -> "Sell".
2. **Nhà bán lẻ**: Chuyển sang ví Retailer -> "Purchase" -> "Receive" -> "Sell".
3. **Người tiêu dùng**: Chuyển sang ví Consumer -> "Purchase" -> Hoàn tất quy trình.

---

## 🧪 Hướng dẫn Kiểm thử (Testing)

### 1. Kiểm thử Tự động (Hardhat)
Chạy lệnh sau tại thư mục gốc của dự án:
```bash
npm test
```
Bộ kiểm thử sẽ kiểm tra:
- Logic tạo và quản lý sản phẩm.
- Quy trình mua bán và chuyển trạng thái.
- Hệ thống ký quỹ và giải quyết tranh chấp.
- Phân quyền truy cập.

### 2. Kiểm thử Thủ công trên Frontend
1. Chạy node cục bộ: `npm run node`.
2. Deploy hợp đồng: `npm run deploy:localhost`.
3. Chạy frontend: `cd frontend && npm run dev`.
4. Mở `http://localhost:3000`, kết nối ví và thực hiện quy trình từ Bước 3 ở trên.
5. Kiểm tra các sự kiện (Events) và thay đổi trạng thái sản phẩm trong mục "Journeys".
