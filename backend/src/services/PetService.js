const petRepository = require("../repositories/PetRepository");

class PetService {

    async getAll(type, personality, search) {
        return petRepository.filter(type, personality, search);
    }

    async create(data) {
        if (!data.name) throw { status: 400, message: "Pet name is required" };
        return petRepository.create(data);
    }

    async update(id, data) {
        const pet = await petRepository.findById(id);
        if (!pet) throw { status: 404, message: "Pet not found" };
        const { name, type, personality, description, image, price, contact, status } = data;
        return petRepository.updateById(id, {
            ...(name        !== undefined && { name }),
            ...(type        !== undefined && { type }),
            ...(personality !== undefined && { personality }),
            ...(description !== undefined && { description }),
            ...(image       !== undefined && { image }),
            ...(price       !== undefined && { price }),
            ...(contact     !== undefined && { contact }),
            ...(status      !== undefined && { status }),
        });
    }

    async delete(id) {
        const pet = await petRepository.deleteById(id);
        if (!pet) throw { status: 404, message: "Pet not found" };
        return { message: "Pet deleted successfully" };
    }

    async adopt(petId, userId) {
        const pet = await petRepository.findById(petId);
        if (!pet) throw { status: 404, message: "Pet not found" };

        // Already adopted by THIS user
        if (pet.adoptedBy.some(id => id.toString() === userId.toString()))
            throw { status: 409, message: "Already adopted" };

        // Adopted by SOMEONE ELSE → not available
        if (pet.adoptedBy.length > 0)
            throw { status: 409, message: "Pet already adopted by another user" };

        pet.adoptedBy.push(userId);
        await pet.save();
        return { message: "Pet adopted!", pet };
    }

    async unadopt(petId, userId) {
        const pet = await petRepository.findById(petId);
        if (!pet) throw { status: 404, message: "Pet not found" };
        pet.adoptedBy = pet.adoptedBy.filter(id => id.toString() !== userId.toString());
        await pet.save();
        return { message: "Adoption removed", pet };
    }

    async getAdopted(userId) {
        return petRepository.findAdoptedByUser(userId);
    }
}

module.exports = new PetService();
