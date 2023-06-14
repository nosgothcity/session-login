import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import viewsRouter from './routes/views.router.js';
import session from 'express-session';

const app = express();

mongoose.connect(`mongodb+srv://coderhouse:coderhouse316@ecommerce.ovm7ngz.mongodb.net/?retryWrites=true&w=majority`, { dbName: 'ecommerce' });
app.engine('handlebars', handlebars.engine());

app.use(express.urlencoded({extended: true}))

app.set('views', __dirname + '/views');
app.set('view engine','handlebars');

app.use(session({
    secret: 'fr3y43i6',
    resave: false,
    saveUninitialized: false
}));

app.use('/', viewsRouter);
app.listen(8080, () => console.log("Listening on PORT 8080"));