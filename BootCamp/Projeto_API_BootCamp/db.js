// Database 
// instancia o sequelize

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

module.exports = app => {
    const config = app.libs.config;
    const sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config.params
    );

    const db = {
        sequelize,
        models: {}
    }

    const dir = path.join(__dirname, 'models'); // faz join para encontrar a pasta de models

    fs.readdirSync(dir).forEach(file => {
        const modelDir = path.join(dir, file); // Join do model com diretoria Files
        const model = sequelize.import(modelDir);
        db.models[model.name] = model;
    });

    // Faz relacao entre as entidades
    Object.keys(db.models).forEach(key => {
        if(db.models[key].hasOwnProperty('associate')) {
            db.models[key].associate(db.models);
        }
    });

    return db;
};