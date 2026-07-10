# DocShare Complete V21

## Điểm mới

- Chỉ giữ **Túi khung avatar**; đã bỏ giao diện Túi danh hiệu và Túi bảng.
- Thêm nhiều khung có chuyển động khác nhau: lôi điện, lửa, nước, gió, thiên thần, rồng, thiên nhiên, băng, bóng kiếm và hoàng gia.
- Thêm hệ thống **Thú cưng tí hon**:
  - Túi có thể chứa nhiều thú cưng.
  - Chỉ tối đa **2 thú cưng** được mang ra ảnh bìa cùng lúc.
  - Thú cưng có thể đi lại trong ảnh bìa, treo cạnh avatar hoặc ngồi cạnh nhóm nút hồ sơ.
  - Có mua thú cưng bằng credit, cho ăn, vuốt ve, bật/tắt và đổi vị trí.
  - Có phụ kiện: nơ, vương miện, kính, khăn, mũ không gian, cánh thiên thần, lôi điện, lửa, nước và gió.
- Bổ sung tài khoản demo và bài đăng mẫu có tiêu đề học thuật, hiện đại hơn.
- Đổi khóa localStorage sang `docshare_complete_v21_pets` để không bị dữ liệu CSS/trạng thái cũ đè lên.

## Giới hạn bản demo

- Dữ liệu hiện lưu bằng localStorage để chạy ngay trên máy.
- Upload và tải file thật cần nối Supabase Storage ở bước triển khai production.
- Các hiệu ứng và âm thanh quà tặng đang chạy phía frontend.

## Kiểm tra build

```bash
npm install
npm run build
```

Kết quả kiểm tra V21: build thành công với Vite.
