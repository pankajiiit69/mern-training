const express = require('express')
const jwt = require('jsonwebtoken')
const UserModel = require('../schema/user')
const userRouter = express.Router();
const { JWT_KEY } = require('../constants')
const mongoose = require('mongoose');

userRouter.post('/saveUser', async (req, resp) => {
    console.log('saveUser called');
    const user = req.body;
    console.log(user);
    try {
        const userModel = await UserModel.create(user);
        userModel.save();
        console.log('User Saved');
        /**
         * Saving user logic implementtaion
         */
        resp.status(200).send({ "status": "User Saved" });
    } catch (error) {
        resp.status(400).send("Bad Request: " + error.message);
    }
})

userRouter.get('/getAllUser', async (req, resp) => {
    console.log('getAllUser called');
    const allUsers = await UserModel.find();
    resp.json(allUsers);
});

userRouter.post('/login', async (req, resp) => {
    console.log('login called');
    const requestUserObj = req.body;
    console.info('User: ' + requestUserObj.username + 'is logging in.');
    const dbUser = await UserModel.findOne({ "username": requestUserObj.username });

    if (dbUser?.password && requestUserObj?.password && dbUser.password === requestUserObj.password) {
        console.log('User found, generating token');
        const tokenPayload = { username: requestUserObj.username }
        const token = jwt.sign(tokenPayload, JWT_KEY, { expiresIn: '1h' });
        console.log('Token generated');
        resp.json({ "token": token });
    } else {
        resp.status(400).send({ "staus": "User Not found" });
    }
});

userRouter.post('/logout', async (req, resp) => {
    console.log('logout called');
    const requestUserObj = req.body;
    console.info('User: ' + requestUserObj.username + 'is logging in.');
    const dbUser = await UserModel.findOne({ "username": requestUserObj.username });

    if (dbUser?.password && requestUserObj?.password && dbUser.password === requestUserObj.password) {
        console.log('User found, generating token');
        const tokenPayload = { username: requestUserObj.username }
        const token = jwt.sign(tokenPayload, JWT_KEY, { expiresIn: '1h' });
        console.log('Token generated');
        resp.json({ "token": token });
    } else {
        resp.status(400).send({ "staus": "User Not found" });
    }
});

module.exports = userRouter;