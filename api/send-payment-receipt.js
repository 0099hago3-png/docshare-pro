import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

function typeLabel(type, planCode) {
  if (type === 'topup') return 'Nạp credit';
  if (type === 'withdraw') return 'Rút tiền';
  if (type === 'premium') {
    return planCode ? `Premium / Gia hạn (${planCode})` : 'Premium / Gia hạn';
  }
  return type;
}

function statusLabel(status) {
  if (status === 'approved') return 'ĐÃ DUYỆT';
  if (status === 'rejected') return 'ĐÃ TỪ CHỐI';
  if (status === 'pending') return 'ĐANG CHỜ DUYỆT';
  return String(status || '').toUpperCase();
}

function buildHtml({ request, profile }) {
  const approved = request.status === 'approved';
  const topup = request.type === 'topup';
  const premium = request.type === 'premium';
  const withdraw = request.type === 'withdraw';

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;background:#f2f6ef;font-family:Arial,Helvetica,sans-serif;color:#173d2d">
  <div style="max-width:680px;margin:0 auto;padding:28px 14px">
    <div style="background:#fffdf7;border:1px solid #d8e7d7;border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(25,75,52,.10)">
      <div style="padding:26px 30px;background:linear-gradient(135deg,#0e6f4d,#21966b);color:white">
        <div style="font-size:13px;letter-spacing:2px;font-weight:700">DOCSHARE PRO</div>
        <h1 style="margin:8px 0 0;font-size:27px">Biên nhận giao dịch</h1>
      </div>

      <div style="padding:28px 30px">
        <p style="margin-top:0;font-size:16px;line-height:1.65">
          Xin chào <strong>${profile.full_name || profile.username || profile.email}</strong>,
          yêu cầu của bạn đã được Admin xử lý.
        </p>

        <div style="display:inline-block;padding:8px 13px;border-radius:999px;background:${approved ? '#e2f6e9' : '#ffe7e7'};color:${approved ? '#087443' : '#b3261e'};font-weight:800;font-size:13px">
          ${statusLabel(request.status)}
        </div>

        <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:15px">
          <tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Mã yêu cầu</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:700">${request.id}</td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Loại giao dịch</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:700">${typeLabel(request.type, request.plan_code)}</td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Số tiền</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:700">${formatMoney(request.amount_vnd)}đ</td></tr>
          ${topup ? `<tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Credit được cộng</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:700;color:#0b8556">+${formatMoney(request.credit_amount)} credit</td></tr>` : ''}
          ${premium ? `<tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Bonus Premium</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:700;color:#0b8556">+${formatMoney(request.bonus_credit || 0)} credit</td></tr>` : ''}
          ${withdraw ? `<tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Phí rút 5%</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:700">${formatMoney(request.fee_vnd)}đ</td></tr><tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Số tiền thực nhận</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:800;color:#0b8556">${formatMoney(request.net_amount_vnd)}đ</td></tr>` : ''}
          <tr><td style="padding:11px 0;border-bottom:1px solid #e8eee7;color:#65776d">Thời gian tạo</td><td style="padding:11px 0;border-bottom:1px solid #e8eee7;text-align:right;font-weight:700">${formatDate(request.created_at)}</td></tr>
          <tr><td style="padding:11px 0;color:#65776d">Ghi chú Admin</td><td style="padding:11px 0;text-align:right;font-weight:700">${request.admin_note || 'Không có'}</td></tr>
        </table>

        <div style="padding:16px 18px;border-radius:14px;background:#f2f8f1;color:#3b594a;line-height:1.6">
          Đây là email tự động từ DocShare Pro. Vui lòng giữ lại email này để đối chiếu khi cần hỗ trợ.
        </div>
      </div>

      <div style="padding:18px 30px;border-top:1px solid #edf1eb;color:#738279;font-size:12px">
        DocShare Pro · Green Academic Library
      </div>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, message: 'Chỉ hỗ trợ POST.' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trên Vercel.');
    }

    if (!gmailUser || !gmailAppPassword) {
      throw new Error('Thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD trên Vercel.');
    }

    const authorization = request.headers.authorization || '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : '';

    if (!token) {
      return response.status(401).json({ ok: false, message: 'Thiếu phiên đăng nhập Admin.' });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return response.status(401).json({ ok: false, message: 'Phiên đăng nhập không hợp lệ.' });
    }

    const { data: adminProfile, error: adminError } = await adminClient
      .from('profiles')
      .select('id,role,status')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (adminError || adminProfile?.role !== 'admin' || adminProfile?.status !== 'active') {
      return response.status(403).json({ ok: false, message: 'Chỉ Admin được gửi biên nhận.' });
    }

    const requestId = String(request.body?.requestId || '').trim();
    if (!requestId) {
      return response.status(400).json({ ok: false, message: 'Thiếu mã yêu cầu giao dịch.' });
    }

    const { data: paymentRequest, error: paymentError } = await adminClient
      .from('payment_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (paymentError) throw paymentError;
    if (!paymentRequest) {
      return response.status(404).json({ ok: false, message: 'Không tìm thấy yêu cầu giao dịch.' });
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id,email,full_name,username,public_id')
      .eq('id', paymentRequest.user_id)
      .maybeSingle();

    if (profileError) throw profileError;

    const recipient = paymentRequest.receipt_email || profile?.email;
    if (!recipient) {
      return response.status(400).json({ ok: false, message: 'Người dùng chưa có email nhận biên nhận.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `${process.env.MAIL_FROM_NAME || 'DocShare Pro'} <${gmailUser}>`,
      to: recipient,
      subject: `[DocShare Pro] ${statusLabel(paymentRequest.status)} - ${typeLabel(paymentRequest.type, paymentRequest.plan_code)}`,
      html: buildHtml({ request: paymentRequest, profile: profile || {} }),
    });

    await adminClient
      .from('payment_requests')
      .update({
        receipt_sent_at: new Date().toISOString(),
        receipt_message_id: info.messageId || null,
      })
      .eq('id', requestId);

    return response.status(200).json({
      ok: true,
      recipient,
      messageId: info.messageId || null,
    });
  } catch (error) {
    console.error('send-payment-receipt:', error);
    return response.status(500).json({
      ok: false,
      message: error?.message || 'Không thể gửi email biên nhận.',
    });
  }
}
