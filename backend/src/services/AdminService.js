const userRepository = require("../repositories/UserRepository");
const articleRepository = require("../repositories/ArticleRepository");
const petRepository = require("../repositories/PetRepository");
const personalityRepository = require("../repositories/PersonalityRepository");

class AdminService {

    async getStats() {
        const [totalUsers, totalArticles, totalPets, totalTests] = await Promise.all([
            userRepository.count({ role: "user" }),
            articleRepository.count(),
            petRepository.count(),
            personalityRepository.count()
        ]);
        return { totalUsers, totalArticles, totalPets, totalPersonalityTests: totalTests };
    }

    async getAllUsers() {
        return userRepository.findAll({}, { select: "-password -resetToken -resetTokenExpiry", sort: { createdAt: -1 } });
    }

    async deleteUser(id) {
        const user = await userRepository.deleteById(id);
        if (!user) throw { status: 404, message: "User not found" };
        return { message: "User deleted successfully" };
    }

    async getPersonalityResults() {
        const results = await personalityRepository.findAllWithUsers();
        const summary = results.reduce((acc, t) => {
            acc[t.result] = (acc[t.result] || 0) + 1;
            return acc;
        }, {});
        return { total: results.length, summary, results };
    }
}

module.exports = new AdminService();
