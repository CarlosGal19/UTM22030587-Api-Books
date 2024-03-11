const { Sequelize } = require('sequelize');

const db = require('../db.js');

const Book = db.books;

const keysFilter = ['genre', 'author', 'publisher'];
keysFilter.sort();
const defaultKeys = ['title', 'isbn', 'year', 'genre', 'author', 'stock', 'publisher'];
defaultKeys.sort();


const getBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.status(200).json(books);
    } catch (error) {
        res.staus(500).json({ message: error.message })
    };
};

const getBook = async (req, res) => {
    try {
        const endpoint = req.params.value;
        if (!endpoint) {
            return res.status(400).json({ message: 'The endpoint is not valid' });
        };
        const book = await Book.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { isbn: endpoint },
                    { title: endpoint }
                ]
            }
        });
        if (!book) {
            return res.status(404).json({ message: 'The book was not found' });
        };
        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    };
};

const addBook = async (req, res) => {
    try {
        const keysReq = Object.keys(req.body);
        keysReq.sort();
        let equals = true;
        for (let i = 0; i < 7; i++) {
            if (defaultKeys[i] !== keysReq[i]) {
                equals = false;
                break;
            }
        }
        if (!equals) {
            return res.status(400).json({ message: 'The keys are not valid' });
        }
        const book = await Book.create(req.body);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    };
};

const removeBook = async (req, res) => {
    try {
        const endpoint = req.params.value;
        if (!endpoint) {
            return res.status(400).json({ message: 'The endpoint is not valid' });
        }
        const book = await Book.destroy({
            where: {
                [Sequelize.Op.or]: [
                    { isbn: endpoint },
                    { title: endpoint }
                ]
            }
        });
        if (book === 0) {
            return res.status(404).json({ message: 'The book was not found' });
        }
        return res.status(200).json('OK');
    } catch (error) {
        return res.status(500).json({ message: error.message });
    };
};

const filterBy = async (req, res) => {
    try {
        const key = req.params.key;
        const value = req.params.value;
        if (!key || !value) {
            return res.status(400).json({ message: 'The endpoint is not valid' });
        };
        if (!keysFilter.includes(key)) {
            return res.status(400).json({ message: `The key ${key} is not valid` });
        };
        const books = await Book.findAll({ where: { [key]: value } });
        if (books.length === 0) {
            return res.status(404).json({ message: `There are no books with the ${key} ${value}` });
        };
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    };
};

const listBooks = async (req, res) => {
    try {
        const books = await Book.findAll({ attributes: ['title', 'author', 'year'] });
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getBooksByYear = async (req, res) => {
    try {
        const yearLooked = req.params.year;
        if (!yearLooked) {
            return res.status(400).json({ message: 'Endpoint not valid' });
        };
        const books = await Book.findAll({ where: { year: parseInt(yearLooked) } });
        if (books.length === 0) {
            return res.status(404).json({ message: `There are no books from the year ${yearLooked}` });
        };
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    };
};

const genreFullAvailability = async (req, res) => {
    try {
        const genre = req.params.genre;
        if (!genre) {
            return res.status(400).json({ message: 'Endpoint not valid' });
        };
        const books = await Book.findAll({ where: { genre: genre } });
        let available = books.every(book => book.dataValues.stock > 0);
        return res.status(200).json(available);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const genrePartialAvailability = async (req, res) => {
    try {
        const genre = req.params.genre;
        if (!genre) {
            return res.status(400).json({ message: 'Endpoint not valid' });
        };
        const books = await Book.findAll({ where: { genre: genre } });
        let available = books.some(book => { book.stock > 0 });
        return res.status(200).json(available);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getCountBy = async (req, res) => {
    try {
        const property = req.params.property;
        if (!property) {
            return res.status(400).json({ message: 'Endpoint not valid' });
        };
        const books = await Book.findAll();
        let counter = books.reduce((acc, book) => {
            acc[book[property]] = (acc[book[property]] || 0) + 1;
            return acc;
        }, {});
        return res.status(200).json(counter);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBooks,
    getBook,
    addBook,
    removeBook,
    filterBy,
    listBooks,
    getBooksByYear,
    genreFullAvailability,
    genrePartialAvailability,
    getCountBy
};
