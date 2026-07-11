DOCSHARE PRO V36 - SỬA BẢNG QUÀ TẶNG + TRẮNG TRANG TÀI LIỆU

Đã sửa trong bản này:
1. Khi bấm "Tặng quà" sẽ mở bảng quà tặng riêng (modal riêng).
2. Thêm nhiều phần quà mới, tổng cộng 22 món.
3. Giữ hiệu ứng riêng theo từng chủ đề quà.
4. Sửa lỗi trang tài liệu bị trắng khi bấm vào.
   - Nguyên nhân: biến recentGifts được gọi nhưng chưa khai báo trong DocumentDetail.jsx.
5. Giữ lại khu "Quà vừa được tặng" trong trang chi tiết tài liệu.
6. Đổi storage key để tránh cache localStorage cũ.

Đã kiểm tra:
- npm install
- vite build: thành công

Nếu vẫn thấy bản cũ:
- Ctrl + F5
- hoặc xóa Local Storage của localhost.
