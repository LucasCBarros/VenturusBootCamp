
const bcrypt = require('bcrypt-nodejs')

module.exports = (sequelize, DataType) => {
    
    const Users = sequelize.define('Users', { // nome é Case Sensitive
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataType.STRING,
            allowNull: false,
            validade: {
                notEmpty: true
            }
        },
        email: {
            type: DataType.STRING,
            unique: true,
            allowNull: false,
            validade: {
                notEmpty: true,
                isEmail: true
            }
        },
        password: {
            type: DataType.STRING(12),
            allowNull: false,
            validade: {
                notEmpty: true,
                len: [8, 12]
            }
        }
    });

    Users.associate = models => {
        Users.hasMany(models.Tasks, {
            onDelete: 'CASCADE' // Como as Tasks dependem de usuario, se deleta usuario deleta todas Tasks dele tbm sao deletadas
        });
    };

    Users.hook('beforeCreate', user => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt); // Salt vem de algoritmo de cryptografia que significa numero inicial de criptografia
    });

    Users.isPassword = (encodedPassword, password) => {
        return bcrypt.compareSync(password, encodedPassword); // inverso da ordem da chamada, serve para conferir se a senha esta correta
    };

    return Users;
    
};