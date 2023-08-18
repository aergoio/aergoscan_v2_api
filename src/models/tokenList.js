module.exports = (sequelize, DataTypes) => {
    const token_list = sequelize.define(
        "token_list",
        {
            id: {
                type: DataTypes.STRING(20),
                allowNull: false,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING(4),
                allowNull: false,
            },
            token_address: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            token_name: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
        },
        {
            charset: "utf8",
            collate: "utf8_general_ci",
            tableName: "token_list",
            timestamps: false,
            paranoid: false,
        }
    );

    return token_list;
};
