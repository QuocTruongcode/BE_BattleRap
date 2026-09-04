// services/authService.js
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { GUEST_USER_ID } = require("../config/constants");
const { User } = require("../../models");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload(); // { sub, email, name, picture, ... }
}

async function findOrCreateUserFromGoogle(payload) {
    const { sub, email, name } = payload;
    console.log("Check payload: ", payload)
    // TODO: thay bằng logic DB thật
    let user = await User.findOne({
        where: {
            google_sub: sub
        }
    });
    console.log("User found in DB:", user);
    if (!user) {
        user = await User.create({
            UserName: name,
            Email: email,
            google_sub: sub,
            UserType: "U2"
        });
    }
    return user;

}

function generateUserToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            role: "user",
            Email: user.Email,
            UserName: user.UserName,
            UserType: user.UserType,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

function generateGuestToken() {
    return jwt.sign(
        { userId: GUEST_USER_ID, role: "guest", Email: null, UserName: "Guest", UserType: "GUEST" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

async function loginWithGoogle(idToken) {
    const payload = await verifyGoogleToken(idToken);
    const user = await findOrCreateUserFromGoogle(payload);
    return generateUserToken(user);
}

function loginAsGuest() {
    return generateGuestToken();
}


async function getUserProfile(userId) {
    const user = await User.findByPk(userId);
    // console.log("User profile fetched:", user);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 401;
        throw error;
    }

    return {
        userId: user.id,
        Email: user.Email,
        UserName: user.UserName,
        UserType: user.UserType,
        // thêm các trường khác nếu model User của bạn có, ví dụ:
        // username: user.username,
    };
}


module.exports = {
    loginWithGoogle,
    loginAsGuest,
    getUserProfile
};