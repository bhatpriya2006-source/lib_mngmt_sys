const express = require('express');
const db = require('./db');
const session = require('express-session');

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "librarysecret",
    resave: false,
    saveUninitialized: false
}));

function isLoggedIn(request, response, next) {
    if (request.session.librarian) {
        next();
    } else {
        response.redirect('/');
    }
}

app.get('/', (request, response) => {
    response.render("login", { error: null });
});

app.post('/login', (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    db.get(`SELECT * FROM LIBRARIANS WHERE EMAIL=? AND PASSWORD=?`, [email, password], (err, row) => {
        if (row) {
            request.session.librarian = row;
            response.redirect("/dashboard");
        } else {
            response.render("login", { error: "invalid credentials" });
        }
    });
});

app.get('/dashboard', isLoggedIn, (request, response) => {
    db.get(`SELECT COUNT(*) AS totalBooks FROM BOOKS`, (err, books) => {
        db.get(`SELECT COUNT(*) AS totalBorrowed FROM BORROWED_BOOKS`, (err, borrowed) => {
            db.get(`SELECT COUNT(*) AS totalVisits FROM LIBRARY_VISITS`, (err, visits) => {
                response.render("dashboard", {
                    librarian: request.session.librarian,
                    totalBooks: books.totalBooks,
                    totalBorrowed: borrowed.totalBorrowed,
                    totalVisits: visits.totalVisits
                });
            });
        });
    });
});

// ========== BOOKS ==========

app.get('/books', (request, response) => {
    db.all(`SELECT * FROM BOOKS`, (err, rows) => {
        response.render("books", { books: rows });
    });
});

app.get('/books/add', (request, response) => {
    response.render("addBook");
});

app.post('/books/add', (request, response) => {
    const title = request.body.title;
    const author = request.body.author;
    const quantity = request.body.quantity;

    db.run(`INSERT INTO BOOKS (TITLE,AUTHOR,QUANTITY) VALUES (?,?,?)`, [title, author, quantity], (err) => {
        if (!err) {
            response.redirect('/books');
        } else {
            console.log(err.message);
        }
    });
});

app.get('/books/edit/:id', (request, response) => {
    db.get(`SELECT * FROM BOOKS WHERE ID=?`, [request.params.id], (err, row) => {
        if (!err) {
            response.render("editBook", { book: row });
        }
    });
});

app.post('/books/edit/:id', (request, response) => {
    const title = request.body.title;
    const author = request.body.author;
    const quantity = request.body.quantity;

    db.run(`UPDATE BOOKS SET TITLE=?, AUTHOR=?, QUANTITY=? WHERE ID=?`, [title, author, quantity, request.params.id], (err) => {
        if (!err) {
            response.redirect('/books');
        }
    });
});

app.get('/books/delete/:id', (request, response) => {
    db.run(`DELETE FROM BOOKS WHERE ID=?`, [request.params.id], (err) => {
        if (!err) {
            response.redirect('/books');
        }
    });
});

// ========== STUDENTS ==========

app.get('/students', (request, response) => {
    db.all(`SELECT * FROM STUDENTS`, (err, rows) => {
        response.render("students", { students: rows });
    });
});

app.get('/students/addStudent', (request, response) => {
    response.render("addStudent");
});

app.post('/students/addStudent', (request, response) => {
    const usn = request.body.usn;
    const name = request.body.name;
    const branch = request.body.branch;

    db.run(`INSERT INTO STUDENTS (USN,NAME,BRANCH) VALUES (?,?,?)`, [usn, name, branch], (err) => {
        if (!err) {
            response.redirect('/students');
        } else {
            console.log(err.message);
        }
    });
});

app.get('/students/edit/:usn', (request, response) => {
    db.get(`SELECT * FROM STUDENTS WHERE USN=?`, [request.params.usn], (err, row) => {
        if (!err) {
            response.render("editStudent", { student: row });
        }
    });
});

app.post('/students/edit/:usn', (request, response) => {
    const name = request.body.name;
    const branch = request.body.branch;

    db.run(`UPDATE STUDENTS SET NAME=?, BRANCH=? WHERE USN=?`, [name, branch, request.params.usn], (err) => {
        if (!err) {
            response.redirect('/students');
        }
    });
});

app.get('/students/delete/:usn', (request, response) => {
    db.run(`DELETE FROM STUDENTS WHERE USN=?`, [request.params.usn], (err) => {
        if (!err) {
            response.redirect('/students');
        }
    });
});

// ========== BORROWED BOOKS ==========

app.get('/borrowbook', (request, response) => {
    db.all(`SELECT * FROM BORROWED_BOOKS`, (err, rows) => {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        rows.forEach(book => {
            const returnDate = new Date(book.RETURN_DATE);
            returnDate.setHours(0, 0, 0, 0);

            const diffDays = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));

            if (book.STATUS === 'Returned') {
                book.DAYS_LEFT = '-';
            } else if (diffDays < 0) {
                book.STATUS = `Overdue by ${Math.abs(diffDays)} day(s)`;
                book.DAYS_LEFT = 0;
            } else if (diffDays === 0) {
                book.STATUS = 'Due Today';
                book.DAYS_LEFT = 0;
            } else {
                book.STATUS = `Borrowed (${diffDays} day(s) left)`;
                book.DAYS_LEFT = diffDays;
            }

            db.run(`UPDATE BORROWED_BOOKS SET STATUS=? WHERE ID=?`, [book.STATUS, book.ID]);
        });

        response.render("borrowbook", { borrowbook: rows });
    });
});

app.get('/borrowbook/borrownew', (request, response) => {
    response.render('borrownew');
});

app.post('/borrowbook/borrownew', (request, response) => {
    const usn = request.body.usn;
    const book_id = request.body.book_id;
    const book_date = request.body.book_date;
    const return_date = request.body.return_date;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rDate = new Date(return_date);
    rDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((rDate - today) / (1000 * 60 * 60 * 24));

    let status;
    if (diffDays < 0) {
        status = `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
        status = 'Due Today';
    } else {
        status = `Borrowed (${diffDays} day(s) left)`;
    }

    db.run(
        `INSERT INTO BORROWED_BOOKS (USN,BOOK_ID,BOOK_DATE,RETURN_DATE,STATUS) VALUES (?,?,?,?,?)`,
        [usn, book_id, book_date, return_date, status],
        (err) => {
            if (err) {
                console.log(err.message);
            } else {
                response.redirect('/borrowbook');
            }
        }
    );
});

app.get('/borrowbook/edit/:id', (request, response) => {
    db.get(`SELECT * FROM BORROWED_BOOKS WHERE ID=?`, [request.params.id], (err, row) => {
        if (!err) {
            response.render('editborrow', { book: row });
        } else {
            console.log(err);
        }
    });
});

app.post('/borrowbook/edit/:id', (request, response) => {
    const usn = request.body.usn;
    const book_id = request.body.book_id;
    const book_date = request.body.book_date;
    const return_date = request.body.return_date;
    const status = request.body.status;

    db.run(
        `UPDATE BORROWED_BOOKS SET USN=?, BOOK_ID=?, BOOK_DATE=?, RETURN_DATE=?, STATUS=? WHERE ID=?`,
        [usn, book_id, book_date, return_date, status, request.params.id],
        (err) => {
            if (!err) {
                response.redirect('/borrowbook');
            } else {
                console.log(err);
            }
        }
    );
});

app.get('/borrowbook/delete/:id', (request, response) => {
    db.run(`DELETE FROM BORROWED_BOOKS WHERE ID=?`, [request.params.id], (err) => {
        if (!err) {
            response.redirect('/borrowbook');
        }
    });
});

// ========== LOGOUT ==========

app.get('/logout', (request, response) => {
    request.session.destroy(() => {
        response.redirect("/");
    });
});


// ========== LIBRARY VISITS ==========

app.get('/visits', (request, response) => {
    db.all(`SELECT * FROM LIBRARY_VISITS`, (err, rows) => {
        response.render("visits", { visits: rows });
    });
});

app.get('/visits/add', (request, response) => {
    response.render("addVisit");
});

app.post('/visits/add', (request, response) => {
    const usn = request.body.usn;
    const entry_time = request.body.entry_time;
    const exit_time = request.body.exit_time;

    // calculate duration in minutes
    const entry = new Date(entry_time);
    const exit = new Date(exit_time);
    const diffMs = exit - entry;
    const duration = Math.round(diffMs / 60000) + ' min(s)';

    db.run(
        `INSERT INTO LIBRARY_VISITS (USN,ENTRY_TIME,EXIT_TIME,DURATION) VALUES (?,?,?,?)`,
        [usn, entry_time, exit_time, duration],
        (err) => {
            if (!err) {
                response.redirect('/visits');
            } else {
                console.log(err.message);
            }
        }
    );
});

app.get('/visits/delete/:id', (request, response) => {
    db.run(`DELETE FROM LIBRARY_VISITS WHERE ID=?`, [request.params.id], (err) => {
        if (!err) {
            response.redirect('/visits');
        }
    });
});


// ========== SERVER ==========

app.listen(5000, () => {
    console.log('running on port 5000');
});