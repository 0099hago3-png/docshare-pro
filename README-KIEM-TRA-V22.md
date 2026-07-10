# DocShare Complete V22 — kiểm tra và cập nhật

## Các phần mới

- Sửa/xóa/báo cáo bình luận trong Bảng tin.
- Sửa/xóa/báo cáo đánh giá tài liệu.
- Trả lời đánh giá chỉ dành cho tác giả; có nút xem/ẩn phản hồi.
- Xem trước file demo; tài liệu đầy đủ chỉ hiện sau khi mua bằng credit.
- Modal xác nhận mua riêng, không dùng hộp thoại của trình duyệt.
- Lịch sử hoạt động chia tab: đã xem, thích, lưu, bình luận, đánh giá, tải, mua và đăng bài.
- Upload hỗ trợ PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, CSV, Markdown, EPUB, ZIP, RAR, 7Z và ảnh.
- Trường/đơn vị có thể bỏ trống, nhập tự do và tìm gần đúng.
- Hashtag có gợi ý gần đúng và lấy thêm từ các tài liệu đang có.
- Túi danh hiệu và Túi bảng được bổ sung trong hồ sơ.
- Bảng tin nhắn, bình luận và đánh giá có giao diện/hiệu ứng riêng.
- Thêm nhiều khung avatar cao cấp: gió, dung nham, biển, cánh sét, phượng, rồng, thiên thần và hắc kiếm.
- Thú cưng được vẽ lại bằng SVG có các bộ phận tách riêng: đầu, thân, tay, chân, đuôi, tai, cánh, mắt.
- Mỗi loài có chuyển động và phản ứng riêng khi tương tác.
- Rồng trưởng thành và Phượng trưởng thành lớn hơn.
- Cổ Long Tinh Vân siêu huyền thoại nằm dưới ảnh bìa, lâu lâu mở mắt và nhìn quanh.
- Vịt Phóng Lợn có hoạt ảnh chỉ mũi và các câu thoại vui.
- Túi thú chứa nhiều con nhưng chỉ cho tối đa 2 con hoạt động ngoài ảnh bìa.

## Cài đặt sạch

Không dán chồng lên thư mục project cũ có nhiều CSS/node_modules.

1. Đổi tên project cũ thành `document-share-react-cu`.
2. Giải nén ZIP V22.
3. Mở thư mục `document-share-react` mới.
4. Chạy `01_CAI_DAT_SACH.bat`.
5. Sau khi cài xong, chạy `04_CHAY_TAT_CA.bat`.

Hoặc dùng Terminal:

```powershell
npm install --registry=https://registry.npmjs.org/
npm run dev
```

## Tài khoản demo

- Admin: `admin@docshare.vn` / `123456`
- User: `user@docshare.vn` / `123456`
- Giảng viên: `teacher@docshare.vn` / `123456`

## Lưu ý dữ liệu

Bản demo dùng localStorage với key mới:

```txt
docshare_complete_v22_advanced
```

Các file upload chỉ lưu tên và bản xem trước ảnh trong trình duyệt. Khi triển khai thật cần nối Supabase Storage để lưu file demo, file đầy đủ và ảnh bìa.

## Kết quả kiểm tra trước khi đóng gói

```txt
Kiểm tra cú pháp JSX/JS: 40 file, không lỗi
Kiểm tra import nội bộ: không thiếu file
npm ci frontend: thành công
npm run build: thành công, 1.819 module được biên dịch
npm ci backend: thành công
GET /api/health: {"ok":true,"service":"docshare-backend"}
```

Vite có cảnh báo bundle JavaScript lớn hơn 500 kB. Đây là cảnh báo tối ưu hiệu năng, không phải lỗi chạy. Khi đưa lên production nên tách trang bằng `React.lazy()` và dynamic import.
