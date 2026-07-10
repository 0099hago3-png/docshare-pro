# DOCSHARE COMPLETE V24

Bản V24 sử dụng giao diện **thư viện học thuật hiện đại** với nền trắng/kem, xanh Oxford và vàng đồng.

## Chạy trên máy

Mở PowerShell trong thư mục có `package.json` rồi chạy:

```powershell
npm install
npm run dev
```

Mở:

```text
http://localhost:5173
```

## Build production

```powershell
npm run build
```

## Đưa bản mới lên GitHub

```powershell
git add .
git commit -m "Cap nhat DocShare V24"
git push origin main
```

Vercel đã kết nối GitHub sẽ tự tạo deployment mới.

## Biến môi trường Supabase trên Vercel

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Lưu ý: V24 vẫn giữ kiến trúc dữ liệu demo/localStorage của các bản trước. Biến Supabase mới chỉ là cấu hình kết nối; muốn dữ liệu đồng bộ thật cần chuyển từng chức năng sang Supabase.
