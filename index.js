const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const {
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
} = require('./queries/book.queries.js');

app.use(bodyParser.json());

// Get all the existent books
app.get('/books', async (req, res) => {
    getBooks(req, res);
});

// Get a book by its title or ISBN
app.get('/book/:value', async (req, res) => {
    getBook(req, res);
});

// Add a new book
app.post('/book/add', async (req, res) => {
    addBook(req, res);
});

// Remove a book by its title or ISBN
app.delete('/book/:value', async (req, res) => {
    removeBook(req, res);
});

// Filter books by genre, author or publisher
app.get('/books/filter/:key/:value', async (req, res) => {
    filterBy(req, res);
});

// List books (only title, author and year)
app.get('/books/list', async (req, res) => {
    listBooks(req, res);
});

// Get books by year
app.get('/books/year/:year', async (req, res) => {
    getBooksByYear(req, res);
});

// It returns true or false if there are books available for a specific genre
app.get('/books/available/full/:genre', async (req, res) => {
    genreFullAvailability(req, res);
});

// It returns true if at least one book is available for a specific genre
app.get('/books/available/partial/:genre', async (req, res) => {
    genrePartialAvailability(req, res);
});

// It returns a object with the name of a property that is being counted and the count of the property
app.get('/books/count/:property', async (req, res) => {
    getCountBy(req, res);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
