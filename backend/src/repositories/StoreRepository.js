const StoreItem = require("../models/StoreItem");

class StoreRepository {
    async findAll(search, category, status) {
        const query = {};
        if (status)   query.status   = status;
        if (category && category !== "all") query.category = category;
        if (search) {
            query.$or = [
                { title:       { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { sellerName:  { $regex: search, $options: "i" } },
            ];
        }
        return StoreItem.find(query).sort({ createdAt: -1 });
    }

    async findById(id)            { return StoreItem.findById(id); }
    async findByUser(userId)      { return StoreItem.find({ sellerId: userId }).sort({ createdAt: -1 }); }
    async create(data)            { return StoreItem.create(data); }
    async updateById(id, data)    { return StoreItem.findByIdAndUpdate(id, data, { new: true }); }
    async deleteById(id)          { return StoreItem.findByIdAndDelete(id); }
}

module.exports = new StoreRepository();
