# DOCSHARE COMPLETE V22 — BẮT ĐẦU

Bản V22 được đóng gói thành một project sạch gồm frontend React/Vite và backend Node.js/Express.

## 1. Thay project cũ an toàn

Không dán chồng lên project đã có nhiều CSS/node_modules cũ.

1. Đổi tên thư mục cũ `document-share-react` thành `document-share-react-cu`.
2. Giải nén file ZIP V22.
3. Đưa thư mục `document-share-react` mới vào `C:\Users\giang\Downloads\`.

## 2. Cài thư viện

Nhấp đúp:

```txt
01_CAI_DAT_SACH.bat
```

Chờ đến khi hiện `CAI DAT XONG`.

Nếu cài thủ công bằng PowerShell:

```powershell
npm install --registry=https://registry.npmjs.org/
cd backend
npm install --registry=https://registry.npmjs.org/
cd ..
```

## 3. Chạy website

Nhấp đúp:

```txt
04_CHAY_TAT_CA.bat
```

Hoặc chạy frontend:

```powershell
npm run dev
```

Mở:

```txt
http://localhost:5173
```

## 4. Tài khoản demo

Admin:

```txt
admin@docshare.vn
123456
```

User:

```txt
user@docshare.vn
123456
```

Giảng viên:

```txt
teacher@docshare.vn
123456
```

## 5. Dữ liệu demo

Bản hiện tại lưu dữ liệu bằng localStorage:

```txt
docshare_complete_v22_advanced
```

Khi nối Supabase thật, chuyển dữ liệu tài khoản, tài liệu, bình luận, thú cưng, khung, giao dịch và file sang PostgreSQL/Supabase Storage.

Xem đầy đủ thay đổi trong:

```txt
README-KIEM-TRA-V22.md
```
