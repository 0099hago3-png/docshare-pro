DOCSHARE PRO V30 - BẢN ĐÃ SỬA

1. Đã sửa trong bản này
- Đổi lại giao diện thẻ tài liệu: bìa lớn, thông tin nằm bên dưới.
- Tất cả chữ/số chuyển sang tông tối dễ đọc hơn.
- Bỏ kiểu chữ xanh trắng khó đọc ở Bảng tin.
- Sửa khung "Sổ tay tài liệu nổi bật" để bấm được.
- Thêm nút "Xem chi tiết" rõ ràng cho tài liệu.
- Sửa lỗi preview tài liệu:
  + Tài liệu free: xem trước toàn bộ.
  + Tài liệu tốn credit: chỉ xem demo nếu chưa mua.
  + Sau khi mua: xem trước toàn bộ + tải file đầy đủ.
- Thêm fallback cho ảnh bìa nếu ảnh lỗi.
- Đổi storage key để reset dữ liệu cũ trong localStorage, tránh UI cũ bị giữ lại.
- Sửa lỗi dữ liệu người dùng bị mất ownedFrames/ownedPets/ownedPanels khi normalize.
- Sửa import thiếu ở trang chi tiết tài liệu.

2. Chạy project
- npm install
- npm run dev

3. Nếu trình duyệt vẫn hiện giao diện cũ
- Mở DevTools -> Application -> Local Storage -> xóa dữ liệu của localhost
hoặc dùng Ctrl + F5 để tải lại cứng.
