-- Người dùng trên web không thể tự thêm danh mục.
-- Admin thêm danh mục mới bằng SQL mẫu dưới đây.
reset role;

insert into public.categories(name, slug, description, icon_key, sort_order)
values (
  'Thiết kế đồ họa',
  'thiet-ke-do-hoa',
  'Tài liệu thiết kế, đồ họa và sáng tạo số.',
  'design',
  230
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order;
