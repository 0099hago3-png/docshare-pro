# DOCSHARE PRO V25 · MODERN ACADEMIC LIBRARY

Bản V25 sử dụng giao diện thư viện học thuật hiện đại với nền trắng kem dịu mắt, xanh thư viện và vàng đồng.

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

Nếu bạn dán V25 đè vào thư mục `document-share-react` cũ đã liên kết GitHub:

```powershell
git add -A
git commit -m "Cap nhat DocShare Pro V25"
git push origin main
```

Vercel đã kết nối GitHub sẽ tự tạo deployment mới.

## Biến môi trường Supabase trên Vercel

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Lưu ý: V25 vẫn giữ kiến trúc dữ liệu demo/localStorage của các bản trước. Biến Supabase mới chỉ là cấu hình kết nối; muốn dữ liệu đồng bộ thật cần chuyển từng chức năng sang Supabase.
