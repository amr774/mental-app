import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { chatService } from '../services/api';
import { Link } from 'react-router-dom';
import './Chatbot.css';

const TYPE_EMOJI = { cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐠', rabbit: '🐰', hamster: '🐹', turtle: '🐢' };
const petEmoji = (type = '') => TYPE_EMOJI[type?.toLowerCase()] || '🐾';

// ── LocalStorage helpers ────────────────────────────────────────────
const CHATS_KEY  = (user) => `mh_chats_v2_${user?.id || user?.email || 'guest'}`;
const loadChats  = (user) => { try { return JSON.parse(localStorage.getItem(CHATS_KEY(user))) || []; } catch { return []; } };
const saveChats  = (user, chats) => { try { localStorage.setItem(CHATS_KEY(user), JSON.stringify(chats)); } catch {} };

const makeChat = (title = '') => ({
    id:        Date.now(),
    title:     title || 'New Chat',
    messages:  [],
    createdAt: Date.now(),
});

// Group chats by date
function groupByDate(chats, t) {
    const now = Date.now();
    const DAY = 86_400_000;
    const groups = { [t('chat.today')]: [], [t('chat.yesterday')]: [], [t('chat.older')]: [] };
    chats.forEach(c => {
        const age = now - c.createdAt;
        if (age < DAY)       groups[t('chat.today')].push(c);
        else if (age < 2*DAY) groups[t('chat.yesterday')].push(c);
        else                  groups[t('chat.older')].push(c);
    });
    return groups;
}

export default function Chatbot() {
    const { user } = useAuth();
    const { t } = useLang();

    const [chats,        setChats]        = useState(() => loadChats(user));
    const [activeChatId, setActiveChatId] = useState(() => {
        const saved = loadChats(user);
        return saved.length ? saved[0].id : null;
    });
    const [sidebarOpen,  setSidebarOpen]  = useState(false);
    const [input,        setInput]        = useState('');
    const [typing,       setTyping]       = useState(false);
    const [search,       setSearch]       = useState('');
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    // Sync when user changes
    useEffect(() => {
        const saved = loadChats(user);
        setChats(saved);
        setActiveChatId(saved.length ? saved[0].id : null);
    }, [user?.id]);

    // Persist chats
    useEffect(() => {
        if (user) saveChats(user, chats);
    }, [chats, user]);

    // Scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats, typing, activeChatId]);

    // Active chat & messages
    const activeChat = chats.find(c => c.id === activeChatId);
    const messages   = activeChat?.messages || [];

    // Filter messages for search
    const displayed = search
        ? messages.filter(m => m.text?.toLowerCase().includes(search.toLowerCase()))
        : messages;

    // ── Chat management ────────────────────────────────────────────
    function updateActiveChat(updater) {
        setChats(prev => prev.map(c => c.id === activeChatId ? updater(c) : c));
    }

    function newChat() {
        const chat = makeChat(t('chat.newChat'));
        setChats(prev => {
            const next = [chat, ...prev];
            saveChats(user, next);
            return next;
        });
        setActiveChatId(chat.id);
        setSidebarOpen(false);
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }

    function selectChat(id) {
        setActiveChatId(id);
        setSidebarOpen(false);
        setSearch('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }

    function deleteChat(id, e) {
        e.stopPropagation();
        setChats(prev => {
            const next = prev.filter(c => c.id !== id);
            saveChats(user, next);
            if (activeChatId === id) setActiveChatId(next.length ? next[0].id : null);
            return next;
        });
    }

    // ── Send message ───────────────────────────────────────────────
    async function sendMessage() {
        if (!input.trim()) return;
        const text = input.trim();

        // If no active chat, create one
        let chatId = activeChatId;
        if (!chatId) {
            const chat = makeChat(text.slice(0, 40));
            setChats(prev => { const n = [chat, ...prev]; saveChats(user, n); return n; });
            chatId = chat.id;
            setActiveChatId(chatId);
        }

        const userMsg = { id: Date.now(), text, sender: 'user' };

        setChats(prev => prev.map(c => {
            if (c.id !== chatId) return c;
            const msgs = [...c.messages, userMsg];
            // Auto-title from first user message
            const title = c.messages.filter(m => m.sender === 'user').length === 0
                ? text.slice(0, 42) + (text.length > 42 ? '…' : '')
                : c.title;
            return { ...c, title, messages: msgs };
        }));

        setInput('');
        setTyping(true);

        try {
            const history  = messages.map(m => ({ text: m.text, sender: m.sender }));
            const response = await chatService.send(text, history);
            const botMsg = {
                id:               Date.now() + 1,
                text:             response.reply,
                sender:           'bot',
                crisis:           response.crisis,
                helpline:         response.helpline,
                hasSuggestions:   response.hasSuggestions || false,
                suggestionAnswered: false,
                showSuggestions:  false,
                pets:             response.recommendedPets    || [],
                articles:         response.recommendedArticles || [],
            };
            setChats(prev => prev.map(c =>
                c.id === chatId ? { ...c, messages: [...c.messages, botMsg] } : c
            ));
        } catch {
            const errMsg = { id: Date.now() + 1, text: t('chat.errorConnect'), sender: 'bot' };
            setChats(prev => prev.map(c =>
                c.id === chatId ? { ...c, messages: [...c.messages, errMsg] } : c
            ));
        } finally {
            setTyping(false);
        }
    }

    // ── Suggestion answer ──────────────────────────────────────────
    function answerSuggestion(msgId, wantsIt) {
        updateActiveChat(c => ({
            ...c,
            messages: c.messages.map(m =>
                m.id === msgId
                    ? { ...m, suggestionAnswered: true, showSuggestions: wantsIt }
                    : m
            ),
        }));
    }

    // ── Delete a single message ────────────────────────────────────
    function deleteMessage(msgId) {
        updateActiveChat(c => ({ ...c, messages: c.messages.filter(m => m.id !== msgId) }));
    }

    // ── Voice ──────────────────────────────────────────────────────
    function startVoice() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.lang = 'ar-EG';
        r.onresult = e => setInput(e.results[0][0].transcript);
        r.start();
    }

    // ── Grouped chats for sidebar ─────────────────────────────────
    const grouped = groupByDate(chats, t);

    return (
        <div className="chat-shell">
            {/* ── Sidebar overlay (mobile) ── */}
            {sidebarOpen && <div className="chat-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* ── Sidebar ── */}
            <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="chat-sidebar-top">
                    <span className="chat-sidebar-brand">🤖 {t('chat.title')}</span>
                    <button className="chat-new-btn btn btn-primary btn-sm" onClick={newChat}>
                        ✏️ {t('chat.newChat')}
                    </button>
                </div>

                <div className="chat-sidebar-list">
                    {chats.length === 0 && (
                        <p className="chat-sidebar-empty">{t('chat.noChats')}</p>
                    )}
                    {Object.entries(grouped).map(([group, items]) =>
                        items.length > 0 && (
                            <div key={group} className="chat-sidebar-group">
                                <p className="chat-sidebar-group-label">{group}</p>
                                {items.map(c => (
                                    <div
                                        key={c.id}
                                        className={`chat-sidebar-item ${c.id === activeChatId ? 'active' : ''}`}
                                        onClick={() => selectChat(c.id)}
                                    >
                                        <span className="chat-sidebar-item-title">{c.title}</span>
                                        <button
                                            className="chat-sidebar-del"
                                            onClick={e => deleteChat(c.id, e)}
                                            title={t('chat.deleteChat')}
                                        >🗑</button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </aside>

            {/* ── Main chat area ── */}
            <div className="chat-main">
                {/* Header */}
                <div className="chat-header">
                    <button className="chat-menu-btn" onClick={() => setSidebarOpen(v => !v)}>☰</button>
                    <div className="chat-avatar">🤖</div>
                    <div>
                        <h2 className="chat-title">{activeChat?.title || t('chat.title')}</h2>
                        <span className="chat-status">
                            <span className="status-dot" />
                            {t('chat.status')}
                        </span>
                    </div>
                    <div className="chat-header-actions">
                        <input
                            className="input search-input"
                            placeholder={t('chat.search')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button className="btn btn-ghost btn-sm" onClick={newChat}>{t('chat.newChat')}</button>
                    </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-empty">
                            <p className="chat-empty-icon">💬</p>
                            <p>{t('chat.empty')}</p>
                        </div>
                    )}

                    {displayed.map((msg) => (
                        <div key={msg.id} className={`msg-row ${msg.sender}`}>
                            {msg.sender === 'bot' && <div className="msg-avatar bot">🤖</div>}
                            <div className="msg-wrap">
                                {msg.crisis && (
                                    <div className="crisis-banner">🚨 {msg.helpline}</div>
                                )}

                                <div className="msg-bubble">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                                    {msg.sender === 'user' && (
                                        <button className="msg-delete" onClick={() => deleteMessage(msg.id)} title="Delete">✕</button>
                                    )}
                                </div>

                                {/* Suggestion prompt */}
                                {msg.hasSuggestions && !msg.suggestionAnswered && (
                                    <div className="suggestion-prompt">
                                        <button
                                            className="btn btn-primary btn-sm sug-yes-btn"
                                            onClick={() => answerSuggestion(msg.id, true)}
                                        >
                                            ✅ {t('chat.sugYes')}
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => answerSuggestion(msg.id, false)}
                                        >
                                            ❌ {t('chat.sugNo')}
                                        </button>
                                    </div>
                                )}

                                {/* Suggestions revealed */}
                                {msg.showSuggestions && (
                                    <>
                                        {msg.pets?.length > 0 && (
                                            <div className="suggestion-block">
                                                <p className="suggestion-label">🐾 {t('chat.suggestedPets')}</p>
                                                <div className="suggestion-cards">
                                                    {msg.pets.map(pet => (
                                                        <Link to="/pets" key={pet._id} className="sug-card">
                                                            <span className="sug-icon">{petEmoji(pet.type)}</span>
                                                            <div>
                                                                <p className="sug-name">{pet.name}</p>
                                                                <p className="sug-meta">{pet.type}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {msg.articles?.length > 0 && (
                                            <div className="suggestion-block">
                                                <p className="suggestion-label">📰 {t('chat.suggestedArticles')}</p>
                                                <div className="suggestion-cards">
                                                    {msg.articles.map(a => (
                                                        <Link to="/articles" key={a._id} className="sug-card sug-article">
                                                            <span className="sug-icon">📄</span>
                                                            <div>
                                                                <p className="sug-name">{a.title}</p>
                                                                <p className="sug-meta">{a.category}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {msg.sender === 'user' && <div className="msg-avatar user">👤</div>}
                        </div>
                    ))}

                    {typing && (
                        <div className="msg-row bot">
                            <div className="msg-avatar bot">🤖</div>
                            <div className="msg-bubble typing-bubble">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <button className="btn btn-ghost voice-btn" onClick={startVoice} title="Voice input">🎤</button>
                    <input
                        ref={inputRef}
                        className="input chat-input"
                        placeholder={t('chat.placeholder')}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    />
                    <button className="btn btn-primary send-btn" onClick={sendMessage} disabled={typing}>
                        {typing ? '…' : t('chat.send')}
                    </button>
                </div>
            </div>
        </div>
    );
}
