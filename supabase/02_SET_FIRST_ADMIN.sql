-- Đổi email bên dưới thành email Admin thật của bạn rồi bấm Run.
reset role;

update public.profiles
set role = 'admin', status = 'active'
where lower(email) = lower('THAY_EMAIL_CUA_BAN@gmail.com');

select id, public_id, email, full_name, username, role, status
from public.profiles
where lower(email) = lower('THAY_EMAIL_CUA_BAN@gmail.com');
