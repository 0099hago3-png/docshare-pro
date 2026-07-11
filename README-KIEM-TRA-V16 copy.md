# KIỂM TRA V16

Đã kiểm tra trước khi đóng gói:

- `npm ci` frontend: thành công.
- `npm run build`: thành công.
- `npm ci` backend: thành công.
- Backend `/api/health`: trả về trạng thái hoạt động.
- Route React và import component: build thành công.
- Excel Admin: dùng thư viện `xlsx`, xuất các sheet Tổng quan, Người dùng, Tài liệu, Giao dịch và Nhật ký Admin.
- Giao diện chỉ dùng nền tối vũ trụ.
- Bảng xếp hạng dùng điểm, không hiển thị quy đổi tiền.
- Kho quà được tách riêng tại `/gifts`.
- Dữ liệu V16 dùng localStorage key mới `docshare_universe_final_v16`.
