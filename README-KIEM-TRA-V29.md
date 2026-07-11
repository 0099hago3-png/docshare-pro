# DocShare Pro V29 – Green Heritage Complete Redesign

## Các phần đã làm lại

- Thay toàn bộ nền đen, xanh đen và các khối tối cũ bằng bảng màu xanh lục – kem – giấy sáng.
- Sửa logo: bỏ hoàn toàn ô vuông xanh biển, dùng logo sách mở và lá cây SVG riêng.
- Tạo bộ khung giao diện bằng ảnh SVG, gồm 4 kiểu: dây lá, trang sách, mái vòm thư viện và khung quản trị.
- Các khu vực không còn dùng một mẫu khung lặp lại quá nhiều.
- Bỏ các vòng tròn phát sáng quanh avatar; thay bằng khung ảnh SVG theo cấp khung.
- Premium dùng hiệu ứng vàng lụa và tia sáng nhẹ, sang trọng hơn, không còn chữ 7 màu chói.
- Bảng tin đổi tiêu đề và điểm nhấn sang xanh lục, tăng độ tương phản chữ.
- Làm lại toàn bộ Admin theo nền sáng, gồm thanh menu, KPI, biểu đồ, hàng dữ liệu, bảng, bộ lọc, modal và cài đặt.
- Làm lại Kho quà bằng ảnh minh họa riêng cho từng loại quà.
- Sửa lỗi tặng quà không hiện: đã gắn `GiftEffect` vào `App.jsx`.
- Khi gửi quà sẽ xuất hiện nghi thức toàn màn hình: ảnh quà bay nhẹ, quỹ đạo, lá vàng rơi, thông tin credit và hiệu ứng theo cấp quà.
- Thêm chuyển động nhẹ cho logo, từng section, card, khung quà và nền cây cỏ.
- Giữ nguyên các chức năng, dữ liệu demo, backend và cấu trúc React/Vite hiện có.

## Các file chính được thêm hoặc sửa

- `src/redesign-v29.css`
- `src/components/GiftArtwork.jsx`
- `src/components/GiftEffect.jsx`
- `src/components/DonateModal.jsx`
- `src/components/Navbar.jsx`
- `src/pages/GiftVault.jsx`
- `src/App.jsx`
- `src/main.jsx`
- `public/brand/docshare-emblem-v29.svg`
- `public/brand/v29/*`
- `public/gifts/v29/*`

## Cách chạy

### Cách 1: dùng file BAT

1. Chạy `01_CAI_DAT_SACH.bat`.
2. Chạy `04_CHAY_TAT_CA.bat`.
3. Mở địa chỉ do Vite hiển thị, thường là `http://localhost:5173`.
4. Nhấn `Ctrl + F5` để trình duyệt tải CSS mới.

### Cách 2: dùng lệnh

```bash
npm install
npm run dev
```

Mở terminal thứ hai nếu cần backend:

```bash
npm --prefix backend install
npm run backend:dev
```

## Kiểm tra build

```bash
npm run build
```

Bản V29 đã được kiểm tra build thành công bằng Vite 8.
