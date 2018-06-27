const { body, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

module.exports = app => {
    const Users = app.db.models.Users;

    app.post('/Users', [
        body('name', 'Required field').exists(),
        body('name', 'Invalid lenght').trim().isLength({min: 1, max:255 }),
        body('email', 'Required field').exists(),
        body('email', 'Invalid email').isEmail(),
        body('password', 'Required field').exists(),
        body('password', 'Invalid lenght').trim().isLength({min: 8, max: 12})
    ],async (req, res) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty) { // Verifica se o array de validacoes gerou array de erro vazio
                return res.status(400).json({ errors: errors.array() }); // Manda o array de erros
            }

            const existingUser = await Users.findOne({
                where: {
                    email: req.body.email
                }
            });

            if (existingUser) {
                return res.status(409).json({msg: 'Email alreasy in use'}); // 409 = conflict
            }

            let user = await Users.create(matchedData(req));

            user = await Users.findById(user.id, {
                attributes: ['id', 'name', 'email', 'created_at', 'updated_at'] // pode ser feito assim ou excluido os campos que nao quer

            });

            res.json(user)
        } catch (error) {
            console.log(error); 
            res.status(500).json({ msg: 'Unexpected error' });
        }
    });
};