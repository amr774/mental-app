require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Journal = require('../src/models/Journal');
const Mood = require('../src/models/Mood');
async function main() {
    if (process.env.NODE_ENV === 'production' || !/\/(mental_demo|mental_portfolio_[0-9]+)(\?|$)/.test(process.env.MONGO_URI || ''))
        throw new Error('Use a separate mental_demo or mental_portfolio_DATE database outside production');
    const email = process.env.DEMO_EMAIL;
    const password = process.env.DEMO_PASSWORD;
    if (!email?.endsWith('@example.test') || !password || password.length < 12)
        throw new Error('Set DEMO_EMAIL at example.test and a unique DEMO_PASSWORD of 12+ characters');
    await mongoose.connect(process.env.MONGO_URI);
    if (await User.exists({ email })) throw new Error('Demo account exists; refusing to overwrite it');
    const user = await User.create({ name: 'Demo Explorer', email, password: await bcrypt.hash(password, 10) });
    await Journal.create({ userId: user._id, title: 'Demo journal', content: 'Synthetic example: took a short walk and planned tomorrow.', mood: '😌' });
    await Mood.create({ userId: user._id, mood: 'happy', note: 'Synthetic demo entry' });
    console.log('Demo account and synthetic journal/mood created. No existing records changed.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
