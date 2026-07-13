# DocShare Pro V50 - Full Supabase Project

Bản dự án React + Vite + Supabase được làm lại từ đầu theo giao diện lá cây thiên nhiên.

## 1. Cài đặt

```bash
npm install
```

Tạo `.env.local` từ `.env.example` và điền URL + Publishable key của Supabase.

## 2. Tạo database

Vào Supabase > SQL Editor và chạy:

```text
supabase/01_RESET_AND_CREATE_DOCSHARE.sql
```

Cảnh báo: file này reset toàn bộ bảng DocShare trong schema `public`. Không xóa tài khoản trong `auth.users`.

## 3. Chạy local

```bash
npm run dev
```

## 4. Build

```bash
npm run build
```

## 5. Tạo Admin

Sau khi đăng ký tài khoản trên web, chạy:

```sql
update public.profiles
set role = 'admin'
where email = 'EMAIL_CUA_BAN';
```

## Các chức năng chính

- Đăng ký / đăng nhập Supabase Auth.
- Tài liệu thật, upload ảnh bìa / demo / file đầy đủ.
- Sửa, xóa tài liệu của chính mình.
- Tim, lưu, xem, bình luận, sửa/xóa bình luận, đánh giá và sửa/xóa đánh giá.
- Bảng tin: đăng, sửa, xóa bài; tim; bình luận.
- Danh mục có sẵn, người dùng không tự tạo.
- Ví, nạp/rút, Premium, lịch sử giao dịch.
- Kho quà và gửi quà bằng credit.
- Tin nhắn trực tiếp, tìm người dùng.
- Admin thống kê và duyệt yêu cầu.
- Giao diện cây lá, xanh kem, responsive.
