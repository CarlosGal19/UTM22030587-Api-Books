const { Sequelize } = require('sequelize');

const db = require('../db.js');

const Book = db.books;

const keysFilter = ['genre', 'author', 'publisher'];
keysFilter.sort();
const defaultKeys = ['title', 'isbn', 'year', 'genre', 'author', 'stock', 'publisher'];
defaultKeys.sort();

function sendReponse(code, body = null) {
    const response = {
        code,
        body,
    };

    switch (code) {
        case 200:
            response.msg = "Ok";
            break;
        case 400:
            response.msg = "Endpoint not valid";
            break;
        case 404:
            response.msg = "Not found";
            break;
        case 500:
            response.msg = "Internal Server Error";
            break;
        default:
            response.msg = "Unknown status code";
    }

    return response;
}

const matchProperties = (keysReq) => {
    keysReq.sort();
    for (let i = 0; i < keysReq.length; i++) {
        if (defaultKeys[i] !== keysReq[i]) {
            return false;
        }
    }
    return true;
}

const getBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.status(200).json({ response: sendReponse(200, books) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    };
};

const getBook = async (req, res) => {
    try {
        const endpoint = req.params.value;
        if (!endpoint) {
            return res.status(400).json({ response: sendReponse(400, 'The endpoint is not valid') });
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
            return res.status(404).json({ response: sendReponse(404, 'The book was not found') });
        };
        return res.status(200).json({ response: sendReponse(200, book) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    };
};

const addBook = async (req, res) => {
    try {
        const keysReq = Object.keys(req.body);
        const isValid = matchProperties(keysReq);
        if (!isValid) {
            return res.status(400).json({ response: sendReponse(400, 'The keys are not valid') });
        }
        const book = await Book.create(req.body);
        return res.status(200).json({ response: sendReponse(200, book) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    };
};

const removeBook = async (req, res) => {
    try {
        const endpoint = req.params.value;
        if (!endpoint) {
            return res.status(400).json({ response: sendReponse(400, 'The endpoint is not valid') });
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
            return res.status(404).json({ response: sendReponse(404, 'The book was not found') });
        }
        return res.status(200).json({ response: sendReponse(200, 'OK') });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    };
};

const filterBy = async (req, res) => {
    try {
        const key = req.params.key;
        const value = req.params.value;
        if (!key || !value) {
            return res.status(400).json({ response: sendReponse(400, 'The endpoint is not valid') });
        };
        if (!keysFilter.includes(key)) {
            return res.status(400).json({ response: sendReponse(400, `The key ${key} is not valid`) });
        };
        const books = await Book.findAll({ where: { [key]: value } });
        if (books.length === 0) {
            return res.status(404).json({ response: sendReponse(404, `There are no books with the ${key} ${value}`) });
        };
        return res.status(200).json({ response: sendReponse(200, books) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    };
};

const listBooks = async (req, res) => {
    try {
        const books = await Book.findAll({ attributes: ['title', 'author', 'year'] });
        return res.status(200).json({ response: sendReponse(200, books) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    }
};

const getBooksByYear = async (req, res) => {
    try {
        const yearLooked = req.params.year;
        if (!yearLooked) {
            return res.status(400).json({ response: sendReponse(400, 'Endpoint not valid') });
        };
        const books = await Book.findAll({ where: { year: parseInt(yearLooked) } });
        if (books.length === 0) {
            return res.status(404).json({ response: sendReponse(404, `There are no books from the year ${yearLooked}`) });
        };
        return res.status(200).json({ response: sendReponse(200, books) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    };
};

const genreFullAvailability = async (req, res) => {
    try {
        const genre = req.params.genre;
        if (!genre) {
            return res.status(400).json({ response: sendReponse(400, 'Endpoint not valid') });
        };
        const books = await Book.findAll({ where: { genre: genre } });
        let available = books.every(book => book.dataValues.stock > 0);
        return res.status(200).json({ response: sendReponse(200, available) });
    } catch (error) {
        res.staus(500).json({
            response: sendReponse(500, error.message)
        });
    }
};

const genrePartialAvailability = async (req, res) => {
    try {
        const genre = req.params.genre;
        if (!genre) {
            return res.status(400).json({ response: sendReponse(400, 'Endpoint not valid') });
        };
        const books = await Book.findAll({ where: { genre: genre } });
        let available = books.some(book => book.dataValues.stock > 0);
        return res.status(200).json({ response: sendReponse(200, available) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    }
};

const getCountBy = async (req, res) => {
    try {
        const property = req.params.property;
        if (!property) {
            return res.status(400).json({ response: sendReponse(400, 'Endpoint not valid') });
        };
        const books = await Book.findAll();
        let counter = books.reduce((acc, book) => {
            acc[book[property]] = (acc[book[property]] || 0) + 1;
            return acc;
        }, {});
        return res.status(200).json({ response: sendReponse(200, counter) });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
    }
};

const partialUpdate = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ response: sendReponse(400, 'The endpoint is not valid') });
        }
        const keysReq = Object.keys(req.body);
        keysReq.sort();
        let exist = true;
        for (let i = 0; i < keysReq.length; i++) {
            if (!defaultKeys.includes(keysReq[i])) {
                exist = false;
                break;
            }
        }
        if (!exist) {
            return res.status(400).json({ response: sendReponse(400, 'The keys are not valid') });
        }
        const book = await Book.update(req.body, {
            where: {
                id: id
            }
        });
        if (book === 0) {
            return res.status(404).json({ response: sendReponse(404, 'The book was not found') });
        }
        return res.status(200).json({ response: sendReponse(200, 'OK') });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) })
    }
};

const totalUpdate = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ response: sendReponse(400, 'The endpoint is not valid') });
        }
        const keysReq = Object.keys(req.body);
        const isValid = matchProperties(keysReq);
        if (!isValid) {
            return res.status(400).json({ response: sendReponse(400, 'The keys are not valid') });
        }
        const book = await Book.update(req.body, {
            where: {
                id: id
            }
        });
        console.log(book)
        if (book === 0) {
            return res.status(404).json({ response: sendReponse(404, 'The book was not found') });
        }
        return res.status(200).json({ response: sendReponse(200, 'OK') });
    } catch (error) {
        res.staus(500).json({ response: sendReponse(500, error.message) });
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
    getCountBy,
    partialUpdate,
    totalUpdate
};
