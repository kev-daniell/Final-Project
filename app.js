if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const localStrat = require('passport-local')
const MongoSanitize = require('express-mongo-sanitize');


const AppError = require('./utilities/AppError');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/user')
const User = require('./models/user')


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);

const sessionConfig = {
    secret: 'thisisabadsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 30,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    }
}
app.use(session(sessionConfig))

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.use(MongoSanitize());

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrat(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://localhost:27017/showApp',
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connection open')
    })
    .catch(e => {
        console.log('ERROR OCCURED', e)
    })

const author = "k6daniel";
var viewMode = 'dark'

//flash middleware
app.use((req, res, next) => {
    console.log(req.query)
    if (!req.user) res.locals.viewMode = viewMode
    else res.locals.viewMode = req.user.viewMode
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

//Routing to home page
app.get('/', async (req, res) => {
    delete req.session.returnTo
    if (req.user) {
        const currentUser = await User.findById(req.user._id).populate('posts').populate('comments')
        const length = currentUser.posts.length - 1;
        const cLength = currentUser.comments.length - 1;
        res.render('home', { user: currentUser, length, cLength })
    } else {
        res.render('entry')
    }
})

//TRASH changing system
app.get('/change', async (req, res) => {
    if (req.user) {
        const currentUser = await User.findById(req.user._id)
        if (currentUser.viewMode == 'light') currentUser.viewMode = 'dark';
        else currentUser.viewMode = 'light'
        await currentUser.save()
    } else {
        if (viewMode == 'light') viewMode = 'dark';
        else viewMode = 'light'
    }
    var redirect = req.session.returnTo || '/'
    res.redirect(redirect)
})


//All the commenting routes
app.use('/posts/:id/comment', commentRoutes)


//All the posting routes
app.use('/posts', postRoutes)

//All user related routes
app.use('/', userRoutes)

app.all('*', (req, res, next) => {
    next(new AppError('Sorry Page Not Found', 404))
})

app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Something went wrong';
    if (!err.status) err.status = 500;
    res.status(err.status).render('error', { err, viewMode })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
