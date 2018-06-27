// Criado na route para gerar tokens

const jwt = require('jwt-simple');

module.exports = app => {
    const Users = app.db.models.Users;
    const config = app.libs.config;

    app.post('/token', async (req, res) => {
        const user = await Users.findOne({
            where: {
                email: req.body.email
            }
        });

        if (user) {
            if (Users.isPassword(user.password, req.body.password)){
                const payload = {
                    id: user.id // Pode usar outras coisas alem do ID para gerar esse token
                };

                res.json({
                    token: jwt.encode(payload, config.jwtSecret)
                });
            } else {
                res.sendStatus(401); // Status: Not Authorized
            }
        } else {
            res.sendStatus(401); // Status: Not Authorized
        }
    });
};