const personalityService = require("../services/PersonalityService");

class PersonalityController {

    async takeTest(req, res) {
        try {
            const result = await personalityService.takeTest(req.user.id, req.body.answers);
            res.json({ message: "Test completed", ...result });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async getMyTests(req, res) {
        try {
            const tests = await personalityService.getUserTests(req.user.id);
            res.json(tests);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = new PersonalityController();
