import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { createHash, isValidPassword } from '../utils.js';
import UserModel from '../models/user.model.js';

const initializePassport = () => {
    passport.use('register', new LocalStrategy({ passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const {firstname, lastname, age} = req.body
            console.log('creando un nuevo usuario....');
            try {
                const user = await UserModel.findOne({ email: username });
                if (user) {
                    return done(null, false, { message: 'Correo electrónico incorrecto.' });
                }
                let admin = false;
                if(username === 'adminCoder@coder.com'){
                    admin = true;
                    console.log('El usuario es admin....');
                }
                const newUser = {
                    firstname, 
                    lastname, 
                    email: username, 
                    age, 
                    password: createHash(password),
                    admin,
                };

                const result = await UserModel.create(newUser);
                return done(null, result);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('login',new LocalStrategy({ usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await UserModel.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'Correo electrónico incorrecto.' });
                }

                const passwordMatch = isValidPassword(user, password);
                if (!passwordMatch) {
                    return done(null, false, { message: 'Contraseña incorrecta.' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
        ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
        const user = await UserModel.findById(id);
        done(null, user);
        } catch (error) {
        done(error);
        }
    });
};

export default initializePassport;
