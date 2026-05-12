const storeRepository = require("../repositories/StoreRepository");

class StoreService {

    async getAll(search, category, status = "available") {
        return storeRepository.findAll(search, category, status);
    }

    async getMyItems(userId) {
        return storeRepository.findByUser(userId);
    }

    async create(userId, sellerName, data) {
        const { title, description, price, category, condition, image, contact } = data;
        if (!title) throw { status: 400, message: "Title is required" };
        if (price === undefined || price === null) throw { status: 400, message: "Price is required" };
        return storeRepository.create({
            sellerId: userId,
            sellerName,
            title,
            description,
            price,
            category:  category  || "general",
            condition: condition || "good",
            image:     image     || "",
            contact:   contact   || "",
        });
    }

    async getAdminAll(search, category) {
        // Admin sees ALL items regardless of status
        return storeRepository.findAll(search, category, null);
    }

    async update(itemId, data, userId, role) {
        const item = await storeRepository.findById(itemId);
        if (!item) throw { status: 404, message: "Item not found" };
        if (item.sellerId.toString() !== userId.toString() && role !== "admin")
            throw { status: 403, message: "Not authorized" };
        const { title, description, price, category, condition, image, contact, status } = data;
        return storeRepository.updateById(itemId, {
            ...(title       !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(price       !== undefined && { price }),
            ...(category    !== undefined && { category }),
            ...(condition   !== undefined && { condition }),
            ...(image       !== undefined && { image }),
            ...(contact     !== undefined && { contact }),
            ...(status      !== undefined && { status }),
        });
    }

    async markSold(itemId, userId, role) {
        const item = await storeRepository.findById(itemId);
        if (!item) throw { status: 404, message: "Item not found" };
        if (item.sellerId.toString() !== userId.toString() && role !== "admin")
            throw { status: 403, message: "Not your item" };
        return storeRepository.updateById(itemId, { status: "sold" });
    }

    async delete(itemId, userId, role) {
        const item = await storeRepository.findById(itemId);
        if (!item) throw { status: 404, message: "Item not found" };
        if (item.sellerId.toString() !== userId.toString() && role !== "admin")
            throw { status: 403, message: "Not authorized" };
        await storeRepository.deleteById(itemId);
        return { message: "Item deleted" };
    }
}

module.exports = new StoreService();
