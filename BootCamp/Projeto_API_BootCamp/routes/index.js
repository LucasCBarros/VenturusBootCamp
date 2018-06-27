// app representa a instancia do express
module.exports = app => {
    // req = request, res = response
    app.get('/', (req, res) => {
    // Responde um status (Funcao mais simples)
    res.json({ status: 'BootCamp API Ok! :) '});
    });
};

// Arquitetura MVC 
// Routes = Controller
// Model = Modelo
// Express = View (pega o Json para mostrar)