const express = require ('express');
const app = express();
const session = require('express-session');
const MongoDBStore = require("connect-mongodb-session")(session);
const bcrypt = require('bcrypt');
const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true, parameterLimit: 100000}));

const mongoDBURL = ""; // MongoDB server URL
const mongoose = require('mongoose');
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', () => console.log("Connection is open"));

// auto get session data from mongoDBURL
const store = new MongoDBStore({
    uri: mongoDBURL,
    collection: "sessions",
});

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false,
    store
}));

const User = require('./models/User.js')

app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/", express.static(path.join(__dirname, "public/images")));
app.use("/views", express.static(path.join(__dirname, "public/views")));

app.get("/*", (req, res, next) => {
    if (req.headers['ajax-request']) {
        next();
    }
    else {
        res.sendFile(path.join(__dirname, "public/html/index.html"));
    }
});

const userRouter = require('./routes/user_router.js');
app.use('/user', userRouter);
const adminRouter = require('./routes/admin_router.js');
app.use('/admin', adminRouter);

// get login status
app.get("/login", (req, res) => {
    console.log(req.session)

    if (req.session.role == 'user') {
        res.send({role: req.session.role, user: req.session.user});
    }
    else {
        res.send({role: req.session.role});
    }
});

// sign up
app.post("/signup", async (req, res) => {
    const {username, password, repeatPassword} = req.body;
    
    if (!username || !password || !repeatPassword){
        res.status(400).send({msg: "Please fill in all the fields!"});
    }
    else if (username.length < 4 || username.length > 20){
        res.status(400).send({msg: "The username should have 4-20 characters!"});
    }
    else if (password.length < 4 || password.length > 20){
        res.status(400).send({msg: "The password should have 4-20 characters!"});
    }
    else if (password !== repeatPassword){
        res.status(400).send({msg: "Please enter the same password!"});
    }
    else{
        try {
            const user = await User.findOne({}).sort({userId: -1}).select("userId").exec();
            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                userId: user ? user.userId + 1 : 1,
                username,
                password: hashedPassword,
                comments: [],
                favLoc: [],
                homeLocation: {}
            });                

            res.send({msg: "Sign up successfully!"});
        }
        catch(err) {
            console.log(err);
            if (err.code === 11000) {
                res.status(409).send({msg: "Username already exists!"});
            }
            else {
                res.status(500).send({err: "500 Server Error"});
            }
        }
    }
});

// logout from user/admin account
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            throw err;
        }
        res.send();
    });
});

const server = app.listen(2064);
