// app representa a instancia do express

const { body, param, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

module.exports = app => {

    /// Versao 1.0
    // app.get('/tasks', (req, res) => {
    //     res.json({
    //         tasks: [
    //             { task1: 'Fazer compras'},
    //             { task2: 'Trocar resistencia chuveiro'}
    //         ]
    //     });
    // });


    /// Versao 2.0
    // app.get('/tasks', (req, res) => {
    // });
    // app.post('/tasks', (req, res) => {
    // });
    // app.get('/tasks/:id', (req, res) => {
    // });
    // app.put('/tasks/:id', (req, res) => {
    // });
    // app.delete('/tasks/:id', (req, res) => {
    // });

    /// Versao 3.0

    const Tasks = app.db.models.Tasks;

    app.route('/tasks')
        .all(app.auth.authenticate())
        .get(async (req, res) => { // Get All Task
            try {
                const tasks = await Tasks.findAll({
                    where: {
                        user_id: req.user.id
                    }
                });
                res.json(tasks);
            } catch (error) {
                console.log(error); //Winston: salva em arquivo os error que deram, talvez seja interesante
                // res.status(500).json(error); // Nunca fazer isso pq expoem o stack para o cliente e outras pessoas
                res.status(500).json({ msg: 'Unexpected error getting tasks' });
            }
        })

        .post([
            // Cria array de validaçoes
            body('title', 'Required field').exists(), // Valida Campo vazio
            body('title', 'Invalid lenght').trim().isLength({ min: 1, max: 255 }) // Valida tamanho string
        ],async (req, res) => { // Create Task
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty) { // Verifica se o array de validacoes gerou array de erro vazio
                    return res.status(400).json({ errors: errors.array() }); // Manda o array de erros
                }

                let task = matchedData(req);
                task.user_id = req.user.id;

                // const task = await Tasks.create(req.body);
                task = await Tasks.create(matchedData(task));
                res.json(task);
            } catch (error) {
                console.log(error); 
                res.status(500).json({ msg: 'Unexpected error creating task' });
            }
        });

    app.route('/tasks/:id')
        .all(app.auth.authenticate())
        .get([
            param('id', 'Not an integer!').isInt()
        ],async (req, res) => { // Get Task by ID
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty) { // Verifica se o array de validacoes gerou array de erro vazio
                    return res.status(400).json({ errors: errors.array() }); // Manda o array de erros
                }

                const task = await Tasks.findOne({
                    where: {
                        id: req.params.id,
                        user_id: req.user.id
                    }
                });

                if (task) {
                    res.json(task);
                } else {
                    res.sendStatus(404); // Not found
                }
            } catch (error) {
                console.log(error); 
                res.status(500).json({ msg: 'Unexpected error' });
            }
        })

        .put([
            param('id', 'Not an integer!').isInt(),
            body('title', 'Required field').exists(), // Valida Campo vazio
            body('title', 'Invalid lenght').trim().isLength({ min: 1, max: 255 }), // Valida tamanho string
            body('done', 'Required field').exists(),
            body('done', 'Not a boolean').isBoolean()
        ],async (req, res) => { // Update Task
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty) { // Verifica se o array de validacoes gerou array de erro vazio
                    return res.status(400).json({ errors: errors.array() }); // Manda o array de erros
                }

                await Tasks.update(matchedData(req), { // Se nao encontra nao faz nada
                    where: {
                        id: req.params.id,
                        user_id: req.user_id
                    }
                });
                res.sendStatus(204); // Update
            } catch (error) {
                console.log(error); 
                res.status(500).json({ msg: 'Unexpected error' });
            }
        })

        .delete([
            param('id', 'Not an integer!').isInt() // Verifica se ele é inteiro
        ],async (req, res) => { // Delete Task
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty) { // Verifica se o array de validacoes gerou array de erro vazio
                    return res.status(400).json({ errors: errors.array() }); // Manda o array de erros
                }

                await Tasks.destroy({ // Se nao encontra nao faz nada
                    where: {
                        id: req.params.id,
                        user_id: req.user.id
                    }
                });
                res.sendStatus(204);

            } catch (error) {
                console.log(error); 
                res.status(500).json({ msg: 'Unexpected error' });
            }
        });


};