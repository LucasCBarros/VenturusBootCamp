
module.exports = (sequelize, DataType) => {
    
    const Tasks = sequelize.define('Tasks', { // nome é Case Sensitive
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataType.STRING,
            allowNull: false,
            validade: {
                notEmpty: true
            }
        }, 
        done: {
            type: DataType.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    Tasks.associate = models => {
        Tasks.belongsTo(models.Users);
    };

    return Tasks;
    
};