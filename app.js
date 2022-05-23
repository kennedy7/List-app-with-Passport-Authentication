const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const bodyParser = require("body-parser")
const {router} = require("./routes/route")
const {listrouter} = require("./routes/listAppRoutes");
const cookieParser = require('cookie-parser');
const passport = require("passport")
const initializePassport = require("./passportConfig");
initializePassport(passport);
const PORT = process.env.PORT;



app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true
}));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize());
app.use(passport.session());

app.use(flash())

app.use(express.json());
app.use(cookieParser())
app.use(router);
app.use(listrouter)



app.listen(PORT, () => {
  console.log(`server running successfully on ${PORT}`);
});

