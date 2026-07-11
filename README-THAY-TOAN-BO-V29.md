# CÁCH THAY TOÀN BỘ SANG DOCSHARE PRO V29

1. Giải nén file ZIP V29.
2. Không chép từng file lẻ. Hãy dùng nguyên thư mục `docshare-complete-v29`.
3. Nếu dự án cũ có dữ liệu `.env`, sao chép giá trị cần thiết sang file `.env` của bản mới.
4. Mở thư mục V29 bằng VS Code.
5. Chạy `01_CAI_DAT_SACH.bat` một lần.
6. Chạy `04_CHAY_TAT_CA.bat`.
7. Khi trang mở, nhấn `Ctrl + F5`.

Nếu chỉ thay frontend trên GitHub/Vercel, hãy đưa toàn bộ nội dung thư mục V29 lên repository rồi deploy lại. Không được bỏ thư mục `public/brand/v29` và `public/gifts/v29`, vì đó là bộ ảnh logo, khung và quà mới.
