import { useState } from "react";
import { Bot, Send, X, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

const BOT = {
  name: "Doci AI",
  avatar: "🤖",
  title: "Trợ lý học tập DocShare Pro",
  intro:
    "Xin chào, mình là Doci AI – trợ lý học tập của DocShare Pro. Mình có thể giúp bạn tìm tài liệu, gợi ý tài liệu phù hợp, hướng dẫn upload và giải thích các chức năng trên website.",
};

const suggestions = [
  "Tìm tài liệu Java",
  "Tài liệu SQL mới nhất",
  "Tài liệu đánh giá cao",
  "Cách upload tài liệu",
  "Admin có quyền gì?",
];

export default function ChatBot({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [chat, setChat] = useState([
    {
      role: "bot",
      text:
        BOT.intro +
        " Bạn có thể hỏi mình ví dụ như: tìm tài liệu Java, tài liệu SQL, tài liệu mới nhất, tài liệu đánh giá cao hoặc cách upload tài liệu.",
      documents: [],
    },
  ]);

  async function sendMessage(textValue) {
    const text = String(textValue || message).trim();

    if (!text) return;

    setChat((items) => [
      ...items,
      {
        role: "user",
        text,
        documents: [],
      },
    ]);

    setMessage("");

    try {
      setLoading(true);

      const result = await api.askChatbot(currentUser?.email || null, text);

      setChat((items) => [
        ...items,
        {
          role: "bot",
          text:
            result.answer ||
            "Doci AI chưa tìm thấy câu trả lời phù hợp. Bạn thử hỏi lại bằng từ khóa ngắn hơn nha.",
          documents: result.documents || [],
        },
      ]);
    } catch (error) {
      setChat((items) => [
        ...items,
        {
          role: "bot",
          text:
            "Doci AI đang gặp lỗi khi kết nối dữ liệu. Bạn kiểm tra backend SQL rồi thử lại nha. Lỗi: " +
            error.message,
          documents: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-2 rounded-full bg-amber-400 px-5 py-4 font-black text-slate-950 shadow-2xl transition hover:scale-105 hover:bg-amber-300"
        >
          <span className="text-xl">{BOT.avatar}</span>
          {BOT.name}
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-[999] flex h-[650px] w-[410px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-2xl text-slate-950">
                {BOT.avatar}
              </div>

              <div>
                <h3 className="font-black text-white">{BOT.name}</h3>
                <p className="text-xs text-slate-400">{BOT.title}</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="border-b border-white/10 bg-slate-900/60 px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-300">
              <Sparkles size={16} />
              Gợi ý câu hỏi nhanh
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => sendMessage(item)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[86%] rounded-3xl px-4 py-3 ${
                    item.role === "user"
                      ? "bg-amber-400 text-slate-950"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {item.role === "bot" && (
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-300">
                      <span>{BOT.avatar}</span>
                      {BOT.name}
                    </div>
                  )}

                  <p className="text-sm leading-6">{item.text}</p>

                  {item.documents?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {item.documents.map((doc) => (
                        <Link
                          key={doc.id}
                          to={`/documents/${doc.id}/read`}
                          onClick={() => setOpen(false)}
                          className="block rounded-2xl border border-white/10 bg-slate-900 p-3 transition hover:border-amber-400/50 hover:bg-slate-800"
                        >
                          <div className="flex items-start gap-2">
                            <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300">
                              <FileText size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="line-clamp-1 text-sm font-bold text-white">
                                {doc.title}
                              </h4>

                              <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                {doc.subject || "Chưa có môn học"} •{" "}
                                {doc.documentKind || doc.type || "Tài liệu"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                ⭐ {doc.rating || 0} • 👁 {doc.views || 0} • ❤️{" "}
                                {doc.favoriteCount || 0}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                  {BOT.avatar} Doci AI đang tìm tài liệu cho bạn...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={submit}
            className="flex gap-2 border-t border-white/10 bg-slate-900 p-3"
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
              placeholder="Nhập: tìm tài liệu Java..."
            />

            <button
              disabled={loading}
              className="rounded-2xl bg-amber-400 px-4 text-slate-950 hover:bg-amber-300 disabled:opacity-60"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}