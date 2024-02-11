const express = require("express");
const path = require("path");
const User = require("./models/user");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const app = express();

const configSession = {
    secret: process.env.YOUR_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}

const db = process.env.YOUR_DB;

mongoose.connect(`mongodb://127.0.0.1:27017/${db}`)
    .then(() => {
        console.log("Connected to Database");
    })
    .catch(e => {
        console.log("Database not connected");
        console.log(e);
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(session(configSession));

const validateLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    next();
}

app.get("/", (req, res) => {
    res.send("This is the home page!");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);

    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.send("Login successful");
    } else {
        res.send("Login not successful");
    }
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });

    await user.save();
    req.session.user_id = user._id;

    res.redirect("/");
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("register");
});

app.get("/secret", validateLogin, (req, res) => {
    res.render("secret");
});

app.get("/topsecret", validateLogin, (req, res) => {
    res.send("You can access top secret route!");
});

app.listen(3000, () => {
    console.log("Listening on Port 3000");
});