import { Bot, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function FloatingActions() {
  const { floatingPanel, toggleFloatingPanel } = useApp();
  return (
    <div className="floating-actions">
      <button className={floatingPanel === 'messages' ? 'is-active' : ''} type="button" onClick={() => toggleFloatingPanel('messages')} title="Tin nhắn"><MessageCircle size={22} /></button>
      <button className={floatingPanel === 'bot' ? 'is-active' : ''} type="button" onClick={() => toggleFloatingPanel('bot')} title="ChatBot"><Bot size={22} /></button>
    </div>
  );
}
