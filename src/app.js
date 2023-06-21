import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import viewsRouter from './routes/views.router.js';
import sessionsRouter from './routes/session.router.js';
import session from 'express-session';
import passport from 'passport';
import initializePassport from './config/passport.config.js'
import flash from 'connect-flash';

const app = express();

mongoose.connect(`mongodb+srv://coderhouse:coderhouse316@ecommerce.ovm7ngz.mongodb.net/?retryWrites=true&w=majority`, { dbName: 'ecommerce' });
app.engine('handlebars', handlebars.engine());

app.use(express.urlencoded({extended: true}));

app.set('views', __dirname + '/views');
app.set('view engine','handlebars');

app.use(session({
    secret: 'fr3y43i6',
    resave: false,
    saveUninitialized: false
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);

app.listen(8080, () => console.log("Listening on PORT 8080"));
