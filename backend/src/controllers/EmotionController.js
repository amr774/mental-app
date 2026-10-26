const AI_URL = process.env.EMOTION_API_URL || "http://localhost:8000";

class EmotionController {
    async health(req, res) {
        try {
            const response = await fetch(`${AI_URL}/health`, {
                signal: AbortSignal.timeout(4000),
            });
            const data = await response.json();
            res.json({ status: "ok", ai: data });
        } catch {
            res.status(503).json({
                status: "unavailable",
                message: "Emotion AI service is offline. Run: uvicorn api_server:app --port 8000",
            });
        }
    }

    async predict(req, res) {
        const { image_base64 } = req.body;
        if (!image_base64) {
            return res.status(400).json({ message: "image_base64 is required" });
        }
        try {
            const response = await fetch(`${AI_URL}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_base64 }),
                signal: AbortSignal.timeout(20000),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                return res.status(response.status).json({ message: err.detail || "AI error" });
            }
            const data = await response.json();
            res.json(data);
        } catch (err) {
            if (err.name === "TimeoutError" || err.cause?.code === "ECONNREFUSED") {
                return res.status(503).json({
                    message: "Emotion AI service is not running. Please start api_server.py first.",
                });
            }
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new EmotionController();
