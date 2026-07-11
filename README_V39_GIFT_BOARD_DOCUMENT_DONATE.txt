DOCSHARE PRO V39 - BẢNG QUÀ TẶNG RIÊNG + DONATE TÀI LIỆU

ĐÃ SỬA:
1. Bảng quà tặng được render bằng React Portal trực tiếp vào document.body.
   - Không còn bị nhét trong khung bài đăng/Bảng tin.
   - Không còn bị CSS transform của bài viết làm co nhỏ.
   - Luôn phủ toàn màn hình như một cửa sổ riêng.
   - Nhấn ESC hoặc bấm ngoài cửa sổ để đóng.
   - Khi mở sẽ khóa cuộn nền.

2. Thêm thanh thông tin người nhận:
   - Hiện đang tặng cho bài đăng hay tài liệu.
   - Hiện tên nội dung.
   - Hiện tên tác giả/người nhận.

3. Nút GỬI QUÀ TẶNG:
   - Nút lớn, màu xanh, luôn nằm rõ ở khung xem trước bên phải.
   - Nếu thiếu credit sẽ bị khóa và hiện số credit còn thiếu.

4. Bảng tin:
   - Đổi nút "Ủng hộ" thành "Gửi quà tặng".
   - Bấm sẽ mở cửa sổ quà riêng toàn màn hình.

5. Trang chi tiết tài liệu:
   - Thêm nút "Gửi quà tặng" ngay cạnh Thích/Yêu thích.
   - Giữ thêm nút Gửi quà tặng trong mục Ủng hộ & đánh giá.
   - Donate tài liệu dùng donateDocument(), trừ credit người gửi, cộng phần chia sẻ cho tác giả, lưu lịch sử và thông báo.

6. Responsive:
   - Desktop: 3 cột Danh mục / Danh sách quà / Xem trước.
   - Tablet và điện thoại: tự chuyển thành 1 cột, không bị mất nút gửi.

ĐÃ KIỂM TRA:
- npm install: OK
- vite build: OK

CÁCH CHẠY:
1. npm install
2. npm run dev
3. Mở localhost:5173
4. Nhấn Ctrl + F5 nếu trình duyệt đang giữ CSS cũ.
