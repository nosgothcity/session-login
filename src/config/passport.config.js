import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import { createHash, isValidPassword } from '../utils.js';
import UserModel from '../models/user.model.js';

const initializePassport = () => {
    passport.use('github', new GitHubStrategy({
        clientID:'Iv1.f575c2538022b7b3',
        clientSecret:'88f403d5bba84d5ee876b0e088b401f6bb214c24',
        callbackURL:'http://localhost:8080/api/sessions/githubcallback',
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log(profile);
                const user = await UserModel.findOne({ email: profile._json.email });
                if (!user) {
                    const newUser = {
                        firstname: profile._json.name,
                        lastname: '', 
                        email: profile._json.email, 
                        age: 30,
                        password: '',
                        admin: false,
                    };
                    const result = await UserModel.create(newUser);
                    done(null, result);
                } else {
                    done(null, user);
                }
            } catch (error) {
                return done(error);
            }
        }
    ));

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
