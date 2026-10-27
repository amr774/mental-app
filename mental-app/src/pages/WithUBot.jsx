import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { withUBotService } from '../services/api';
import './WithUBot.css';

// ── LocalStorage helpers ──────────────────────────────────────────
const KEY    = (user) => `wu_chats_v1_${user?.id || user?.email || 'guest'}`;
const load   = (user) => { try { return JSON.parse(localStorage.getItem(KEY(user))) || []; } catch { return []; } };
const save   = (user, chats) => { try { localStorage.setItem(KEY(user), JSON.stringify(chats)); } catch { /* Storage may be unavailable; keep the in-memory state. */ } };
const mkChat = (title = 'New Chat') => ({ id: Date.now(), title, messages: [], createdAt: Date.now() });

function groupByDate(chats) {
    const now = Date.now(), DAY = 86_400_000;
    return {
        'Today':     chats.filter(c => now - c.createdAt < DAY),
        'Yesterday': chats.filter(c => now - c.createdAt >= DAY && now - c.createdAt < 2 * DAY),
        'Older':     chats.filter(c => now - c.createdAt >= 2 * DAY),
    };
}

export default function WithUBot() {
    const { user } = useAuth();

    const [chats,        setChats]        = useState(() => load(user));
    const [activeChatId, setActiveChatId] = useState(() => { const s = load(user); return s.length ? s[0].id : null; });
    const [sidebarOpen,  setSidebarOpen]  = useState(false);
    const [input,        setInput]        = useState('');
    const [typing,       setTyping]       = useState(false);

    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => {
        const s = load(user);
        setChats(s);
        setActiveChatId(s.length ? s[0].id : null);
    }, [user?.id]);

    useEffect(() => { if (user) save(user, chats); }, [chats, user]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chats, typing, activeChatId]);

    const activeChat = chats.find(c => c.id === activeChatId);
    const messages   = activeChat?.messages || [];

    function updateActive(fn) {
        setChats(prev => prev.map(c => c.id === activeChatId ? fn(c) : c));
    }

    function newChat() {
        const chat = mkChat('New Chat');
        setChats(prev => { const n = [chat, ...prev]; save(user, n); return n; });
        setActiveChatId(chat.id);
        setSidebarOpen(false);
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }

    function selectChat(id) {
        setActiveChatId(id);
        setSidebarOpen(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }

    function deleteChat(id, e) {
        e.stopPropagation();
        setChats(prev => {
            const next = prev.filter(c => c.id !== id);
            save(user, next);
            if (activeChatId === id) setActiveChatId(next.length ? next[0].id : null);
            return next;
        });
    }

    async function sendMessage() {
        if (!input.trim()) return;
        const text = input.trim();

        let chatId = activeChatId;
        if (!chatId) {
            const chat = mkChat(text.slice(0, 40));
            setChats(prev => { const n = [chat, ...prev]; save(user, n); return n; });
            chatId = chat.id;
            setActiveChatId(chatId);
        }

        const userMsg = { id: Date.now(), text, sender: 'user' };

        setChats(prev => prev.map(c => {
            if (c.id !== chatId) return c;
            const isFirst = c.messages.filter(m => m.sender === 'user').length === 0;
            const title   = isFirst ? text.slice(0, 42) + (text.length > 42 ? '…' : '') : c.title;
            return { ...c, title, messages: [...c.messages, userMsg] };
        }));

        setInput('');
        setTyping(true);

        try {
            const history  = [...messages, userMsg].map(m => ({ text: m.text, sender: m.sender }));
            const response = await withUBotService.send(text, history);

            const botMsg = {
                id:      Date.now() + 1,
                text:    response.reply,
                sender:  'bot',
                crisis:  response.crisis,
                hotline: response.hotline,
                rec:     response.recommendedArticle || null,
                petRec:  response.recommendedPet     || null,
                emotion: response.emotion,
            };

            setChats(prev => prev.map(c =>
                c.id === chatId ? { ...c, messages: [...c.messages, botMsg] } : c
            ));
        } catch {
            const errMsg = { id: Date.now() + 1, text: "Connection error. Please try again.", sender: 'bot' };
            setChats(prev => prev.map(c =>
                c.id === chatId ? { ...c, messages: [...c.messages, errMsg] } : c
            ));
        } finally {
            setTyping(false);
        }
    }

    function deleteMessage(msgId) {
        updateActive(c => ({ ...c, messages: c.messages.filter(m => m.id !== msgId) }));
    }

    function startVoice() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.lang = 'ar-EG';
        r.onresult = e => setInput(e.results[0][0].transcript);
        r.start();
    }

    const grouped = groupByDate(chats);

    const EMOTION_EMOJI = { sad: '😔', anxious: '😰', angry: '😠', lonely: '😶', happy: '😊', neutral: '💬', crisis: '🚨' };

    return (
        <div className="wu-shell">
            {sidebarOpen && <div className="wu-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`wu-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="wu-sidebar-top">
                    <span className="wu-sidebar-brand">🤍 WithUBot</span>
                    <button className="btn btn-primary btn-sm wu-new-btn" onClick={newChat}>✏️ New</button>
                </div>

                <div className="wu-sidebar-list">
                    {chats.length === 0 && <p className="wu-sidebar-empty">No chats yet</p>}
                    {Object.entries(grouped).map(([group, items]) =>
                        items.length > 0 && (
                            <div key={group}>
                                <p className="wu-sidebar-group-label">{group}</p>
                                {items.map(c => (
                                    <div
                                        key={c.id}
                                        className={`wu-sidebar-item ${c.id === activeChatId ? 'active' : ''}`}
                                        onClick={() => selectChat(c.id)}
                                    >
                                        <span className="wu-sidebar-item-title">{c.title}</span>
                                        <button className="wu-sidebar-del" onClick={e => deleteChat(c.id, e)}>🗑</button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </aside>

            {/* Main */}
            <div className="wu-main">
                {/* Header */}
                <div className="wu-header">
                    <button className="wu-menu-btn" onClick={() => setSidebarOpen(v => !v)}>☰</button>
                    <div className="wu-avatar">🤍</div>
                    <div>
                        <h2 className="wu-title">{activeChat?.title || 'WithUBot'}</h2>
                        <span className="wu-status">
                            <span className="wu-status-dot" /> Online
                        </span>
                    </div>
                    <div className="wu-header-actions">
                        <button className="btn btn-ghost btn-sm" onClick={newChat}>✏️ New Chat</button>
                    </div>
                </div>

                {/* Messages */}
                <div className="wu-messages">
                    {messages.length === 0 && (
                        <div className="wu-empty">
                            <p className="wu-empty-icon">🤍</p>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Hi, I'm WithUBot</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Your empathetic companion. Tell me how you're feeling.
                            </p>
                        </div>
                    )}

                    {messages.map(msg => (
                        <div key={msg.id} className={`wu-msg-row ${msg.sender}`}>
                            {msg.sender === 'bot' && <div className="wu-msg-avatar bot">🤍</div>}
                            <div className="wu-msg-wrap">
                                {msg.crisis && (
                                    <div className="wu-crisis-banner">🚨 Crisis Helpline: {msg.hotline}</div>
                                )}
                                <div className="wu-msg-bubble">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                                    {msg.sender === 'user' && (
                                        <button className="wu-msg-delete" onClick={() => deleteMessage(msg.id)}>✕</button>
                                    )}
                                </div>

                                {/* Emotion badge */}
                                {msg.sender === 'bot' && msg.emotion && msg.emotion !== 'neutral' && (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        {EMOTION_EMOJI[msg.emotion]} {msg.emotion}
                                    </span>
                                )}

                                {/* Article recommendation */}
                                {msg.rec && (
                                    <div className="wu-rec-card">
                                        <span className="wu-rec-icon">📰</span>
                                        <div>
                                            <p className="wu-rec-name">{msg.rec.name}</p>
                                            <p className="wu-rec-desc">{msg.rec.description}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Pet recommendation — toggle button */}
                                {msg.petRec && (
                                    <div>
                                        <button
                                            className="wu-pet-toggle-btn"
                                            onClick={() => updateActive(c => ({
                                                ...c,
                                                messages: c.messages.map(m =>
                                                    m.id === msg.id ? { ...m, showPet: !m.showPet } : m
                                                )
                                            }))}
                                        >
                                            🐕 {msg.showPet ? 'Hide companion' : 'See a companion'}
                                        </button>
                                        {msg.showPet && (
                                            <div className="wu-rec-card wu-rec-card--pet">
                                                <span className="wu-rec-icon">🐕</span>
                                                <div>
                                                    <p className="wu-rec-name">{msg.petRec.name} <span className="wu-rec-badge">{msg.petRec.category}</span></p>
                                                    <p className="wu-rec-desc">{msg.petRec.description}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {msg.sender === 'user' && <div className="wu-msg-avatar user">👤</div>}
                        </div>
                    ))}

                    {typing && (
                        <div className="wu-msg-row bot">
                            <div className="wu-msg-avatar bot">🤍</div>
                            <div className="wu-msg-bubble wu-typing-bubble">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="wu-input-area">
                    <button className="btn btn-ghost wu-voice-btn" onClick={startVoice} title="Voice">🎤</button>
                    <input
                        ref={inputRef}
                        className="wu-input"
                        placeholder="How are you feeling today?"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    />
                    <button className="btn btn-primary wu-send-btn" onClick={sendMessage} disabled={typing}>
                        {typing ? '…' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}
