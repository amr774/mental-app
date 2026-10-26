const journalRepository = require("../repositories/JournalRepository");

class JournalService {
    async create(userId, { title, content, mood }) {
        if (!content) throw { status: 400, message: "Content is required" };
        return journalRepository.create({ userId, title, content, mood });
    }

    async getByUser(userId) {
        return journalRepository.findByUser(userId);
    }

    async update(id, userId, { title, content, mood }) {
        const entry = await journalRepository.findById(id);
        if (!entry) throw { status: 404, message: "Entry not found" };
        if (entry.userId.toString() !== userId.toString())
            throw { status: 403, message: "Forbidden" };
        if (content !== undefined && !content)
            throw { status: 400, message: "Content is required" };
        return journalRepository.updateById(id, { title, content, mood });
    }

    async delete(id, userId) {
        const entry = await journalRepository.findById(id);
        if (!entry) throw { status: 404, message: "Entry not found" };
        if (entry.userId.toString() !== userId.toString())
            throw { status: 403, message: "Forbidden" };
        await journalRepository.deleteById(id);
        return { message: "Entry deleted" };
    }
}

module.exports = new JournalService();
