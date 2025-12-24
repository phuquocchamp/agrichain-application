# Hệ Thống Quản Lý Uy Tín (Reputation System) - AgriChain

## 1. Tổng Quan
Hệ thống Reputation là module lõi giúp **cân bằng niềm tin** trong chuỗi cung ứng AgriChain. Thay vì chỉ dựa vào niềm tin vô hình, hệ thống số hóa uy tín của từng thành viên (Nông dân, Nhà phân phối, Nhà bán lẻ) thành điểm số minh bạch trên Blockchain.

## 2. Các Tính Năng Chính

### 🛡️ Khởi Tạo Uy Tín (Initial Trust)
**Cơ chế:** Ngay khi Admin xác minh (`verifyUser`) một tài khoản mới, hệ thống tự động khởi tạo hồ sơ uy tín với điểm khởi điểm là **500**. Điều này đảm bảo mọi người chơi mới đều có xuất phát điểm như nhau.

```solidity
// File: contracts/utils/Reputation.sol
function registerUser(address user) external onlyOwnerOrAuthorized {
    if (reputations[user].isActive) {
        return;
    }
    
    reputations[user] = ReputationData({
        score: 500, // Điểm khởi đầu: 500
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        lastUpdate: block.timestamp,
        isActive: true
    });
}
```

### 🔄 Tự Động Hóa Điểm Số (Automated Scoring)
Hệ thống tự động điều chỉnh điểm số dựa trên kết quả giao dịch thực tế. Ví dụ, khi Nhà phân phối nhận hàng thành công, Nông dân sẽ được cộng điểm. Đặc biệt, hệ thống xử lý khéo léo trường hợp User chưa verify để không làm gián đoạn chuỗi cung ứng.

**Code trong SupplyChain (Kích hoạt):**
```solidity
// File: contracts/supplyChain/SupplyChain.sol
function receivedItemByDistributor(uint256 _productCode) external ... {
    // ... logic nhận hàng ...
    items[_productCode].itemState = State.ReceivedByDistributor;
    
    // Tự động gọi sang Reputation để cộng điểm cho Farmer
    reputationContract.recordTransactionSuccess(items[_productCode].farmerID, msg.sender);
    
    emit ReceivedByDistributor(_productCode);
}
```

**Code trong Reputation (Xử lý):**
```solidity
// File: contracts/utils/Reputation.sol
function recordTransactionSuccess(address user, address partner) external onlyOwnerOrAuthorized {
    // Nếu user chưa verify (chưa active), bỏ qua nhưng KHÔNG báo lỗi (return)
    // Fix: Đảm bảo giao dịch hàng hóa không bị revert vì lỗi user chưa verify
    if (!reputations[user].isActive) {
        return;
    }
    
    // Ghi nhận đã có tương tác giữa 2 người (cho tính năng Review)
    hasInteracted[partner][user] = true;
    hasInteracted[user][partner] = true;
    
    // Logic cộng điểm
    ReputationData storage rep = reputations[user];
    // ...
    if (rep.score < MAX_SCORE) {
        rep.score = rep.score + 10;
    }
    // ...
}
```

### 🚫 Chống Đánh Giá Giả Mạo (Anti-Fake Reviews)
Đây là tính năng bảo mật quan trọng nhất. User A **chỉ được phép** đánh giá User B nếu hai người **đã từng có giao dịch** (đã được ghi nhận qua `hasInteracted`).

```solidity
// File: contracts/utils/Reputation.sol
function addReview(address reviewee, uint256 rating, string memory comment) 
    external 
    validRating(rating) 
    activeUser(reviewee) 
    returns (uint256) 
{
    require(msg.sender != reviewee, "Cannot review yourself");
    
    // BẮT BUỘC: Phải có lịch sử tương tác trước đó mới được review
    require(hasInteracted[msg.sender][reviewee], "No interaction history");

    // ... logic lưu review ...
}
```

## 3. Luồng Hoạt Động (Workflow)

1.  **Bước 1: Verify & Init**
    *   Admin gọi `SupplyChain.verifyUser(UserA)`.
    *   -> Trigger `Reputation.registerUser(UserA)` -> Score = 500.

2.  **Bước 2: Transaction & Update**
    *   Farmer bán hàng -> Distributor mua hàng.
    *   Distributor gọi `receiveItemByDistributor()` trong `SupplyChain.sol`.
    *   -> Trigger `Reputation.recordTransactionSuccess(Farmer)` -> Điểm Farmer tăng 10.
    *   -> Hệ thống ghi nhận: `hasInteracted[Distributor][Farmer] = true`.

3.  **Bước 3: Review**
    *   Distributor gọi `addReview(Farmer, 5 sao)`.
    *   -> Hệ thống kiểm tra: `require(hasInteracted[Distributor][Farmer])`.
    *   -> Hợp lệ: Lưu đánh giá và cộng thêm điểm thưởng.

---
*Tài liệu này dùng cho mục đích trình bày và demo tính năng.*
