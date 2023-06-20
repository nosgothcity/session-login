import { Router } from 'express';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/products.model.js';
import passport from 'passport';

const router = Router();

//Funcion para obtener los productos con el plugin de paginacion
const getProducts = async (limit, page, sort, dataQuery) => {
    try {
        const options = {
            page,
            limit,
            sort,
            customLabels: {
                docs: 'payload',
            },
            lean: true,
            leanWithId: true,
        };
        const products = await ProductModel.paginate(dataQuery, options);
        return products;
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        throw error;
    }
};

// Middleware para validar rutas privadas y publicas
const privateRoute = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

const publicRoute = (req, res, next) => {
    if (!req.session.user) {
        next();
    } else {
        res.redirect('/profile');
    }
};

router.get('/', publicRoute, (req,res)=>{
    res.render('home', { title: "Express" })
})

router.post('/register', 
    passport.authenticate('register', {
        successRedirect: '/login',
        failureRedirect: '/',
        failureFlash: true,
    }),
);

router.get('/login', publicRoute, (req, res) => {
    res.render('login');
});

router.post('/login',
    passport.authenticate('login', {failureRedirect: '/login',}), async (req, res) => {
        if(!req.user){
            return res.status(400).send({status: "error", error: "Credenciales incorrectas"});
        }
        req.session.user = req.user;
        res.redirect('/profile');
    }
);

router.get('/profile', privateRoute, (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        const { firstname, lastname, email, age } = req.session.user;
        res.render('profile', { firstname, lastname, email, age });
    }
});

router.get('/logout', privateRoute, (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/productsList', privateRoute, async (req, res) => {
    const limit = req.query.limit??10;
    const page = req.query.page??1;
    const query = req.query.query??null;
    const sort = req.query.sort??null;
    let sortType;
    let queryData;

    if(sort && sort === 'desc'){
        sortType = {price: -1};
    }else if(sort && sort === 'asc'){
        sortType = {price: 1};
    }else{
        sortType = {};
    }

    if(query){
        try{
            queryData = JSON.parse(query);
        } catch (error) {
            return res.status(400).send({status: 'error', message: 'Bad Request.'});
        }
    } else {
        queryData = {};
    }

    const products = await getProducts(limit, page, sortType, queryData);
    if(products.payload.length > 0){
        products.status = 'success';
        if(products.prevPage){
            products.prevPage = `http://localhost:8080/productsList?page=${products.prevPage}&limit=${limit}`;
        }
        if(products.nextPage){
            products.nextPage = `http://localhost:8080/productsList?page=${products.nextPage}&limit=${limit}`;
        }
    } else {
        products.status = 'error';
        products.prevPage = null;
        products.nextPage = null;
    }

    res.render('productsList', {
        products: products.payload,
        hasNextPage: products.hasNextPage,
        hasPrevPage: products.hasPrevPage,
        nextPage: products.nextPage,
        prevPage: products.prevPage,
        username: req.session.user.firstname,
        is_admin: req.session.user.admin,
    });
});

export default router;
