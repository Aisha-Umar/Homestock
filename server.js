const express = require('express')
const cors = require('cors')
const app = express()
const indexRoutes = require('./routes/index')
const authRoutes = require('./routes/auth')
const path = require("path")
require('dotenv').config()
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
require("./config/passport")(passport)

app.use(express.urlencoded({extended:true}))
app.use(express.json())

//Sessions
app.use(session({
  secret:'keyboard cat',
  resave: false,
  saveUninitialized:false,
  cookie: { secure: false },
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Flash
app.use(flash())

//Make flash messages available in views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})


app.use(cors())
app.use(express.static('public'))
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'))


app.use('/', indexRoutes)
app.use('/', authRoutes)
app.use('/api', indexRoutes)


const uri = process.env.MONGO_URI
const PORT = process.env.PORT || 3000

// 1. Simplified Connection Function
async function start() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect simply
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB (GroceriDB)');
    console.log("Connected DB:", mongoose.connection.name);


    // 2. Start Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server: http://localhost:${PORT}`);
    });

    // 3. Set the AI Timeout (2 minutes)
    server.timeout = 120000;

  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Stop the app if DB isn't running
  }
}

start();