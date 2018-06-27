module.exports = app => {
    // "app.db.sync" Cria uma tabela automaticamente para voce, mas nao atualiza automaticamente
    // "force: true" Sempre que tiver uma alteracao ele mata tudo e cria denovo, obs: NAO USAR EM PRODUCAO
    app.db.sequelize.sync({force: true}).done(() => {

        app.listen(app.get('port'), () => {

            console.log(`BootCamp API - porta ${app.get('port')}`);
        });
    });
};