const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRepository = require("../repositories/UserRepository");

class AuthService {

    async register(name, email, password) {
        if (!name || !email || !password)
            throw { status: 400, message: "Name, email, and password are required" };

        if (password.length < 6)
            throw { status: 400, message: "Password must be at least 6 characters" };

        const existing = await userRepository.findByEmail(email);
        if (existing)
            throw { status: 400, message: "Email already registered" };

        const hashed = await bcrypt.hash(password, 10);
        const user = await userRepository.create({ name, email, password: hashed });

        return { id: user._id, name: user.name, email: user.email, role: user.role };
    }

    async login(email, password) {
        if (!email || !password)
            throw { status: 400, message: "Email and password are required" };

        const user = await userRepository.findByEmail(email);
        if (!user)
            throw { status: 400, message: "Invalid email or password" };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw { status: 400, message: "Invalid email or password" };

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
    }

    async forgotPassword(email) {
        if (process.env.NODE_ENV === 'production')
            throw { status: 503, message: 'Password recovery is not configured. Contact the site operator.' };
        const user = await userRepository.findByEmail(email);
        if (!user) return { message: "If this email exists, a reset token has been sent." };

        const resetToken = crypto.randomBytes(20).toString("hex").toUpperCase();
        await userRepository.updateById(user._id, {
            resetToken,
            resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000)
        });

        // In production: send via email. Token is NOT returned in response.
        console.log(`[DEV] Reset token for ${email}: ${resetToken}`);
        return { message: "If this email exists, a reset token has been sent." };
    }

    async resetPassword(email, token, newPassword) {
        if (!email || !token || !newPassword)
            throw { status: 400, message: "Email, token, and new password are required" };

        if (newPassword.length < 6)
            throw { status: 400, message: "Password must be at least 6 characters" };

        const user = await userRepository.findByEmail(email);
        if (!user || !user.resetToken)
            throw { status: 400, message: "Invalid or expired reset token" };

        if (user.resetToken !== token.toUpperCase())
            throw { status: 400, message: "Invalid reset token" };

        if (user.resetTokenExpiry < new Date())
            throw { status: 400, message: "Token expired. Please request a new one." };

        const hashed = await bcrypt.hash(newPassword, 10);
        await userRepository.updateById(user._id, {
            password: hashed,
            resetToken: undefined,
            resetTokenExpiry: undefined
        });

        return { message: "Password reset successfully ✅" };
    }
}

module.exports = new AuthService();
