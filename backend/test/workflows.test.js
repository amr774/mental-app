require('dotenv').config();
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
test('isolated MongoDB authentication, journal ownership, moods, goals and avatar upload', async t => {
    const uri = process.env.MONGO_URI || '';
    assert.match(uri, /^mongodb:\/\/127\.0\.0\.1:\d+\/mental_(test|portfolio_[0-9]+)(\?|$)/, 'Use a dedicated local test database');
    assert.notEqual(process.env.NODE_ENV, 'production');
    await mongoose.connect(uri);
    const app = require('../src/app');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const ids = []; let avatar;
    t.after(async () => {
        for (const name of ['Journal', 'Mood', 'Goal']) await require(`../src/models/${name}`).deleteMany({ userId: { $in: ids } });
        await require('../src/models/User').deleteMany({ _id: { $in: ids } });
        if (avatar) require('node:fs').unlinkSync(require('node:path').join(require('../src/config/uploads'), 'avatars', avatar));
        await new Promise(resolve => server.close(resolve)); await mongoose.disconnect();
    });
    const request = async (path, method = 'GET', body, token) => {
        const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body && JSON.stringify(body) });
        return { status: res.status, body: await res.json() };
    };
    assert.equal((await request('/health')).status, 200);
    assert.equal((await request('/journal')).status, 401);
    const tokens = [];
    for (let i=0;i<2;i++) {
        const email = `qa-${randomUUID()}@example.test`, password = randomUUID();
        const registered = await request('/register','POST',{ name: 'Synthetic QA', email, password });
        assert.equal(registered.status, 201);
        const login = await request('/login','POST',{email,password});
        assert.equal(login.status,200); tokens.push(login.body.token); ids.push(login.body.user.id);
        assert.equal(login.body.user.password, undefined);
    }
    const journal = await request('/journal','POST',{title:'QA',content:'Synthetic journal',mood:'calm'},tokens[0]);
    assert.equal(journal.status,201);
    assert.equal((await request(`/journal/${journal.body._id}`,'PUT',{content:'Forbidden'},tokens[1])).status,403);
    assert.equal((await request(`/journal/${journal.body._id}`,'PUT',{content:'Edited'},tokens[0])).status,200);
    assert.equal((await request('/moods','POST',{mood:'happy',note:'Synthetic'},tokens[0])).status,201);
    assert.equal((await request('/moods/history','GET',undefined,tokens[0])).body.length,1);
    const goal = await request('/goals','POST',{title:'Demo walk',weekStart:'2026-10-26'},tokens[0]);
    assert.equal(goal.status,201);
    assert.equal((await request(`/goals/${goal.body._id}/toggle`,'PATCH',{date:'2026-10-27'},tokens[0])).status,200);
    const form = new FormData();
    form.append('avatar', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/1sAAAAASUVORK5CYII=','base64')], { type:'image/png' }), 'avatar.html');
    const uploaded = await fetch(base+'/profile/avatar',{method:'POST',headers:{Authorization:`Bearer ${tokens[0]}`},body:form});
    assert.equal(uploaded.status,200);
    const result = await uploaded.json(); avatar = result.avatar.split('/').pop();
    assert.ok(avatar.endsWith('.png'));
    const image = await fetch(base+result.avatar);
    assert.equal(image.status,200); assert.match(image.headers.get('content-type'),/image\/png/);
    assert.equal((await request('/emotion/predict','POST',{},tokens[0])).status,400);
});
