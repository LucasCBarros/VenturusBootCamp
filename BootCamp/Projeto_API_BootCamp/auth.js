// Verifica no banco se o usuario ainda existe

const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');

module.exports = app => {
    const Users = app.db.models.Users;
    const config = app.libs.config;

    const params = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwtSecret // Diz qual a chave que usou pra cryptografar para ele conseguir descroptografar
    };

    const strategy = new Strategy(params, 
        async(payload, done) => { // payload é o objeto descriptografado que chegou
        try {
            const user = await Users.findById(payload.id);

            if (user) {
                return done(null, {
                    id: user.id,
                    email: user.email
                });
            } else {
                return done(null, false); // retorna 401
            }
        } catch (error) {
            return done(error, null);
        }     
    });

    passport.use(strategy);

    return {
        initialize: () => {
            return passport.initialize();
        },
        authenticate: () => {
            return passport.authenticate('jwt', config.jwtSession);
        }
    }
};