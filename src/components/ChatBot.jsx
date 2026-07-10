import { useState } from 'react';

const answers = [
  ['nạp credit', 'Vào Ví → Nạp credit, chọn mệnh giá, quét QR và ghi đúng nội dung chuyển khoản. Giao dịch sẽ chờ xác thực 5 phút.'],
  ['premium', 'Premium cho phép đăng 20 tài liệu/ngày, file lớn hơn tài khoản thường và có huy hiệu nổi bật.'],
  ['rút tiền', 'Vào Ví → Rút tiền, chọn tài khoản ngân hàng đã lưu hoặc thêm tài khoản mới, nhập số tiền và gửi yêu cầu cho admin.'],
  ['báo cáo', 'Bấm nút lá cờ trên tài liệu hoặc bài đăng, chọn lý do báo cáo và gửi cho admin kiểm tra.'],
  ['upload', 'Vào Đăng tải, nhập thông tin, chọn ảnh bìa, file demo và file đầy đủ.'],
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Chào bạn, mình là trợ lý AI DocShare. Bạn cần hỏi gì?' }]);
  const [text, setText] = useState('');

  function send() {
    const value = text.trim();
    if (!value) return;
    const found = answers.find(([key]) => value.toLowerCase().includes(key));
    setMessages((prev) => [...prev, { from: 'me', text: value }, { from: 'bot', text: found ? found[1] : 'Mình đã ghi nhận câu hỏi. Bạn có thể hỏi về nạp credit, premium, upload, báo cáo hoặc rút tiền.' }]);
    setText('');
  }

  return (
    <>
      <button className="ai-fab" onClick={() => setOpen(!open)}>AI</button>
      {open && (
        <div className="chatbot-box">
          <div className="chat-head"><b>🤖 Trợ lý AI</b><button onClick={() => setOpen(false)}>×</button></div>
          <div className="chat-body">
            {messages.map((msg, index) => <p key={index} className={msg.from}>{msg.text}</p>)}
          </div>
          <div className="chat-input"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Hỏi về DocShare..." /><button onClick={send}>Gửi</button></div>
        </div>
      )}
    </>
  );
}
