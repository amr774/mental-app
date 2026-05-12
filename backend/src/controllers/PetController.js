const petService = require("../services/PetService");

class PetController {

    async getAll(req, res) {
        try {
            const { type, personality, search } = req.query;
            const pets = await petService.getAll(type, personality, search);
            res.json(pets);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async create(req, res) {
        try {
            const pet = await petService.create(req.body);
            res.status(201).json(pet);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async update(req, res) {
        try {
            const pet = await petService.update(req.params.id, req.body);
            res.json(pet);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await petService.delete(req.params.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async adopt(req, res) {
        try {
            const result = await petService.adopt(req.params.id, req.user.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async unadopt(req, res) {
        try {
            const result = await petService.unadopt(req.params.id, req.user.id);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getAdopted(req, res) {
        try {
            const pets = await petService.getAdopted(req.user.id);
            res.json(pets);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new PetController();
