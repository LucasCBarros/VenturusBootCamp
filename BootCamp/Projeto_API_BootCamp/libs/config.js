// Armazenar configuracoes do projeto

// igual a "module.exports = app => {" mas nao precisa
module.exports = {
    database: 'BootCamp',
    // Usuario e senha do servidor (Nao do usuario)
    username: '',
    password: '',
    params: {
        dialect: 'sqlite',
        storage: 'bootcamp.sqlite',
        define: {
            underscored: true
        }
    },
    // Chave de criptografia (ATENCAO: nao versionar com essa chave!!! Extremamente secreta)
    jwtSecret: 'Bo0tC4mp_@P1',
    jwtSession: {
        session: false
    }
};