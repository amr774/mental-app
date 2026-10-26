import { useNavigate } from 'react-router-dom';
import './ChatSelect.css';

const BOTS = [
    {
        path:        '/chatbot',
        icon:        '🤖',
        name:        'Mindful AI',
        tagline:     'Your smart mental health companion',
        description: 'Chat freely about how you feel. Mindful AI listens, detects your mood, and suggests articles or pet companions to help you feel better.',
        color:       '#f87171',
        gradient:    'linear-gradient(135deg, #f87171, #ef4444)',
    },
    {
        path:        '/withubot',
        icon:        '🤍',
        name:        'WithUBot',
        tagline:     'Your empathetic digital friend',
        description: 'A warm, human-like companion that truly listens. Powered by a mental health knowledge base with deep emotional support and personalised article recommendations.',
        color:       '#60a5fa',
        gradient:    'linear-gradient(135deg, #60a5fa, #3b82f6)',
    },
];

export default function ChatSelect() {
    const navigate = useNavigate();

    return (
        <div className="cs-shell">
            <div className="cs-header">
                <h1 className="cs-title">Choose your companion</h1>
                <p className="cs-subtitle">Both are here to support you — pick the one that feels right for you today.</p>
            </div>

            <div className="cs-cards">
                {BOTS.map(bot => (
                    <button
                        key={bot.path}
                        className="cs-card"
                        onClick={() => navigate(bot.path)}
                        style={{ '--bot-color': bot.color, '--bot-gradient': bot.gradient }}
                    >
                        <div className="cs-card-icon" style={{ background: bot.gradient }}>
                            {bot.icon}
                        </div>
                        <h2 className="cs-card-name">{bot.name}</h2>
                        <p className="cs-card-tagline">{bot.tagline}</p>
                        <p className="cs-card-desc">{bot.description}</p>
                        <span className="cs-card-btn" style={{ background: bot.gradient }}>
                            Start chatting →
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
