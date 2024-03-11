module.exports = (sequelize, Sequelize) => {
    const Book = sequelize.define(
        "book",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: Sequelize.STRING
            },
            isbn: {
                type: Sequelize.STRING
            },
            year: {
                type: Sequelize.INTEGER
            },
            genre: {
                type: Sequelize.STRING
            },
            author: {
                type: Sequelize.STRING
            },
            stock: {
                type: Sequelize.INTEGER
            },
            publisher: {
                type: Sequelize.STRING
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        },
        {
            timestamps: false,
            freezeTableName: true,
            tableName: "books"
        }
    );
    return Book;
};
