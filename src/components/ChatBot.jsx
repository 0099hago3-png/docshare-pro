import { useMemo, useRef, useState } from 'react';
import {
  BookOpen, Bot, ChevronDown, CircleHelp, CreditCard, FileUp, Gift,
  HelpCircle, History, MessageCircleQuestion, Search, Send, ShieldCheck,
  Sparkles, UserRound, WalletCards, X,
} from 'lucide-react';

const faqGroups = [
  {
    id: 'account', label: 'Tài khoản', icon: UserRound,
    items: [
      { q: 'Làm sao đăng ký tài khoản?', a: 'Chọn Đăng ký, nhập họ tên, email, mật khẩu và trường học. Sau khi tạo xong, bạn được chuyển vào DocShare Pro và có thể cập nhật hồ sơ, ảnh đại diện, ngành học trong trang cá nhân.' },
      { q: 'Tôi quên mật khẩu thì làm gì?', a: 'Ở trang đăng nhập, chọn Quên mật khẩu. Khi hệ thống Supabase Auth được bật, liên kết đặt lại mật khẩu sẽ được gửi qua email. Trong bản demo, bạn có thể dùng gợi ý mật khẩu đã lưu hoặc nhờ quản trị viên hỗ trợ.' },
      { q: 'Làm sao đổi ảnh đại diện?', a: 'Mở Hồ sơ cá nhân → bấm biểu tượng máy ảnh trên avatar → chọn ảnh → căn chỉnh vị trí và độ phóng → Lưu. Khung avatar đang chọn sẽ tự ôm sát ảnh mới.' },
      { q: 'Tích xanh có ý nghĩa gì?', a: 'Tích xanh cho biết tài khoản đã được xác minh. Quản trị viên có thể cấp hoặc thu hồi trạng thái xác minh sau khi kiểm tra thông tin tác giả, giảng viên hoặc đơn vị.' },
      { q: 'Làm sao theo dõi một tác giả?', a: 'Bấm vào tên hoặc avatar của tác giả để mở hồ sơ, sau đó chọn Theo dõi. Danh sách người đang theo dõi xuất hiện ở hồ sơ và cột bên trái của Bảng tin.' },
    ],
  },
  {
    id: 'documents', label: 'Tài liệu', icon: BookOpen,
    items: [
      { q: 'Làm sao đăng tài liệu?', a: 'Vào Đăng tải → nhập tên, mô tả, môn học và danh mục → chọn tệp đầy đủ → thêm ảnh bìa tỷ lệ 9:16 → nhập hashtag → bấm Đăng tài liệu. Bạn có thể thêm trường/đơn vị hoặc để trống.' },
      { q: 'DocShare hỗ trợ loại tệp nào?', a: 'Giao diện hỗ trợ PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, ZIP và một số định dạng học tập phổ biến. Khi nối Supabase Storage thật, nên cấu hình giới hạn dung lượng và MIME type cho từng bucket.' },
      { q: 'Ảnh bìa nên có kích thước nào?', a: 'Nên dùng ảnh dọc tỷ lệ 9:16, rõ nét, không cần chèn lại toàn bộ tiêu đề vì tên tài liệu đã hiển thị bên ngoài. JPG hoặc PNG là phù hợp.' },
      { q: 'Làm sao xem trước tài liệu?', a: 'Mở trang chi tiết tài liệu và chọn từng mục ở cột Xem trước. Phần demo có thể gồm trang bìa, mục lục và một số trang nội dung mẫu.' },
      { q: 'Làm sao tìm tài liệu theo trường hoặc hashtag?', a: 'Vào Tài liệu → mở bộ lọc nâng cao → nhập trường/đơn vị hoặc hashtag. Tìm kiếm hỗ trợ gần đúng nên bạn không cần gõ hoàn toàn chính xác.' },
      { q: 'Tại sao tài liệu chưa xuất hiện?', a: 'Tài liệu mới có thể ở trạng thái chờ duyệt. Hãy kiểm tra lịch sử đăng tải, thông báo hoặc liên hệ quản trị viên nếu trạng thái không thay đổi sau thời gian dài.' },
    ],
  },
  {
    id: 'wallet', label: 'Ví & Premium', icon: WalletCards,
    items: [
      { q: 'Làm sao nạp credit?', a: 'Vào Ví & Premium → Nạp credit → chọn mệnh giá → quét QR/chuyển khoản → ghi đúng nội dung được hệ thống hiển thị → bấm Tôi đã chuyển khoản. Yêu cầu sẽ chờ quản trị viên xác nhận.' },
      { q: 'Credit dùng để làm gì?', a: 'Credit dùng cho quà tặng, một số quyền mở rộng và các tiện ích trong cộng đồng. Điểm xếp hạng và credit là hai loại khác nhau; điểm xếp hạng không tự quy đổi thành tiền.' },
      { q: 'Làm sao rút tiền tác giả?', a: 'Vào Ví & Premium → Rút tiền → chọn hoặc thêm tài khoản ngân hàng → nhập số tiền từ mức tối thiểu → gửi yêu cầu. Quản trị viên sẽ kiểm tra và cập nhật trạng thái.' },
      { q: 'Premium có quyền lợi gì?', a: 'Premium có hạn mức đăng cao hơn, hỗ trợ tệp lớn hơn, huy hiệu nổi bật, một số khung avatar riêng và ưu tiên hiển thị phù hợp theo chính sách của hệ thống.' },
      { q: 'Tại sao giao dịch đang chờ?', a: 'Giao dịch cần được đối chiếu nội dung chuyển khoản, số tiền và tài khoản nhận. Trạng thái sẽ chuyển sang Đã xử lý hoặc Từ chối kèm ghi chú sau khi quản trị viên kiểm tra.' },
      { q: 'Tôi có thể lưu nhiều tài khoản ngân hàng không?', a: 'Có. Trong mục Rút tiền, bạn có thể thêm nhiều tài khoản và chọn tài khoản phù hợp cho từng yêu cầu. Hãy kiểm tra kỹ số tài khoản và tên chủ tài khoản trước khi gửi.' },
    ],
  },
  {
    id: 'community', label: 'Cộng đồng', icon: MessageCircleQuestion,
    items: [
      { q: 'Làm sao đăng bài trên Bảng tin?', a: 'Mở Bảng tin → nhập nội dung → có thể đính kèm tài liệu → chọn Đăng bài. Nên đặt tiêu đề rõ ràng, chia đoạn dễ đọc và thêm câu hỏi để khuyến khích thảo luận.' },
      { q: 'Làm sao sửa hoặc xóa bình luận?', a: 'Ở bình luận của bạn, chọn Sửa để cập nhật nội dung hoặc Xóa để gỡ bình luận. Quản trị viên cũng có quyền xử lý nội dung vi phạm.' },
      { q: 'Làm sao báo cáo nội dung?', a: 'Bấm menu ba chấm hoặc biểu tượng báo cáo tại bài viết, tài liệu hay bình luận → chọn lý do → bổ sung mô tả nếu cần → Gửi báo cáo. Bạn có thể theo dõi thông báo xử lý sau đó.' },
      { q: 'Làm sao gửi quà cho tác giả?', a: 'Bấm Tặng quà/Ủng hộ → chọn quà → kiểm tra số credit → xác nhận. Hệ thống hiển thị hiệu ứng tri ân và cập nhật điểm ủng hộ cho tài liệu hoặc bài đăng.' },
      { q: 'Bảng xếp hạng tính điểm thế nào?', a: 'Điểm được tổng hợp từ hoạt động, tài liệu, bài đăng, lượt xem, lượt tải, lượt thích và đóng góp cộng đồng. Từng tab có tiêu chí riêng và phần thưởng khung theo mùa.' },
      { q: 'Làm sao nhận khung avatar?', a: 'Khung được mở theo cấp, Premium, nhiệm vụ, sự kiện hoặc thứ hạng mùa. Vào Hồ sơ → Túi khung avatar để xem khung đã sở hữu và chọn khung đang dùng.' },
    ],
  },
  {
    id: 'support', label: 'Hỗ trợ', icon: ShieldCheck,
    items: [
      { q: 'Làm sao gửi yêu cầu hỗ trợ?', a: 'Vào Hỗ trợ → nhập tiêu đề và mô tả chi tiết → Gửi yêu cầu. Nên nêu rõ trang gặp lỗi, thao tác đã thực hiện và ảnh chụp màn hình nếu có.' },
      { q: 'Tôi thấy chữ bị mất hoặc màu khó đọc?', a: 'Hãy nhấn Ctrl + F5 để tải lại CSS mới. Nếu vẫn còn, gửi ảnh màn hình kèm đường dẫn trang và tỷ lệ zoom trình duyệt để kiểm tra đúng khu vực.' },
      { q: 'Website trên Vercel chưa cập nhật?', a: 'Kiểm tra GitHub đã có commit mới, Vercel đã tạo deployment mới và trạng thái là Ready. Sau đó mở đúng domain Production rồi nhấn Ctrl + F5.' },
      { q: 'Làm sao liên hệ quản trị viên?', a: 'Bạn có thể mở Trung tâm hỗ trợ, gửi ticket hoặc dùng Tin nhắn. Với giao dịch, hãy cung cấp mã giao dịch, thời gian và nội dung chuyển khoản; không gửi mật khẩu hay secret key.' },
    ],
  },
];

const allFaqs = faqGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));

function findAnswer(value) {
  const normalized = value.toLowerCase();
  const direct = allFaqs.find((item) => normalized.includes(item.q.toLowerCase().replace(/[?]/g, '')) || item.q.toLowerCase().includes(normalized));
  if (direct) return direct;
  const keywordMap = [
    [['nạp', 'credit'], 'Làm sao nạp credit?'], [['rút', 'tiền'], 'Làm sao rút tiền tác giả?'],
    [['premium'], 'Premium có quyền lợi gì?'], [['đăng', 'tài liệu'], 'Làm sao đăng tài liệu?'],
    [['ảnh', 'bìa'], 'Ảnh bìa nên có kích thước nào?'], [['báo cáo'], 'Làm sao báo cáo nội dung?'],
    [['khung', 'avatar'], 'Làm sao nhận khung avatar?'], [['vercel'], 'Website trên Vercel chưa cập nhật?'],
    [['màu', 'chữ'], 'Tôi thấy chữ bị mất hoặc màu khó đọc?'], [['hỗ trợ'], 'Làm sao gửi yêu cầu hỗ trợ?'],
  ];
  const mapped = keywordMap.find(([keys]) => keys.every((key) => normalized.includes(key)));
  return mapped ? allFaqs.find((item) => item.q === mapped[1]) : null;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('account');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Chào bạn! Mình là trợ lý Hỏi đáp DocShare Pro. Hãy chọn một câu hỏi có sẵn hoặc nhập điều bạn đang cần hỗ trợ.' },
  ]);
  const [text, setText] = useState('');
  const [showQuestions, setShowQuestions] = useState(true);
  const bodyRef = useRef(null);

  const activeGroup = useMemo(() => faqGroups.find((group) => group.id === category) || faqGroups[0], [category]);

  function appendQuestion(question) {
    const item = allFaqs.find((faq) => faq.q === question);
    if (!item) return;
    setMessages((prev) => [...prev, { from: 'me', text: item.q }, { from: 'bot', text: item.a, title: item.group }]);
    setShowQuestions(false);
    window.setTimeout(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' }), 40);
  }

  function send() {
    const value = text.trim();
    if (!value) return;
    const found = findAnswer(value);
    setMessages((prev) => [
      ...prev,
      { from: 'me', text: value },
      {
        from: 'bot',
        title: found?.group || 'Gợi ý hỗ trợ',
        text: found?.a || 'Mình chưa tìm thấy câu trả lời chính xác. Bạn hãy chọn một nhóm câu hỏi bên dưới hoặc vào Trung tâm hỗ trợ để gửi yêu cầu chi tiết cho quản trị viên.',
      },
    ]);
    setText('');
    setShowQuestions(!found);
    window.setTimeout(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' }), 40);
  }

  return (
    <>
      <button className="ai-fab help-fab-v28" onClick={() => setOpen((value) => !value)} title="Hỏi đáp DocShare Pro" aria-label="Mở hộp hỏi đáp">
        {open ? <X size={21}/> : <MessageCircleQuestion size={23}/>}
      </button>
      {open && (
        <section className="chatbot-box chatbot-box-v28" aria-label="Trợ lý hỏi đáp DocShare Pro">
          <header className="chat-head chat-head-v28">
            <div className="chatbot-brand-v28"><span><Bot size={22}/></span><div><b>Hỏi đáp DocShare Pro</b><small>Trợ lý thư viện · phản hồi tức thì</small></div></div>
            <button onClick={() => setOpen(false)} aria-label="Đóng"><X size={19}/></button>
          </header>

          <div className="chat-search-v28">
            <Search size={17}/>
            <input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Nhập câu hỏi của bạn..."/>
            <button onClick={send} aria-label="Gửi câu hỏi"><Send size={17}/></button>
          </div>

          <div className="chat-category-tabs-v28 custom-scroll">
            {faqGroups.map((group) => {
              const Icon = group.icon;
              return <button key={group.id} className={category === group.id ? 'active' : ''} onClick={() => { setCategory(group.id); setShowQuestions(true); }}><Icon size={15}/>{group.label}</button>;
            })}
          </div>

          <div className="chat-body chat-body-v28 custom-scroll" ref={bodyRef}>
            {messages.map((msg, index) => (
              <div key={`${msg.from}-${index}`} className={`chat-message-v28 ${msg.from}`}>
                {msg.from === 'bot' && <span className="chat-avatar-v28"><Bot size={16}/></span>}
                <div>{msg.title && <small>{msg.title}</small>}<p>{msg.text}</p></div>
              </div>
            ))}

            <div className="chat-faq-title-v28">
              <div><CircleHelp size={17}/><b>{activeGroup.label}</b><span>{activeGroup.items.length} câu hỏi</span></div>
              <button onClick={() => setShowQuestions((value) => !value)}>{showQuestions ? 'Thu gọn' : 'Xem câu hỏi'}<ChevronDown size={16}/></button>
            </div>
            {showQuestions && <div className="chat-faq-list-v28">{activeGroup.items.map((item) => <button key={item.q} onClick={() => appendQuestion(item.q)}><HelpCircle size={16}/><span>{item.q}</span></button>)}</div>}
          </div>

          <footer className="chat-footer-v28">
            <span><Sparkles size={14}/> Có {allFaqs.length} câu trả lời hướng dẫn</span>
            <a href="/support">Trung tâm hỗ trợ</a>
          </footer>
        </section>
      )}
    </>
  );
}
