const personalityRepository = require("../repositories/PersonalityRepository");

class PersonalityService {

    async takeTest(userId, answers) {
        if (!answers || !Array.isArray(answers) || answers.length === 0)
            throw { status: 400, message: "Answers array is required" };

        const score = answers.reduce((a, b) => a + b, 0);
        let result = score < 10 ? "Calm" : score < 20 ? "Social" : "Anxious";

        const test = await personalityRepository.create({ userId, answers, result });
        return { result, testId: test._id };
    }

    async getUserTests(userId) {
        return personalityRepository.findByUser(userId);
    }
}

module.exports = new PersonalityService();
