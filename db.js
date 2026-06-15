const sqlite3 = require('sqlite3');

const db = new sqlite3.Database("library.db", (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to database');
    }
});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS LIBRARIANS(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            NAME TEXT,
            EMAIL VARCHAR(50),
            PASSWORD VARCHAR(50)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS STUDENTS(
            USN TEXT PRIMARY KEY,
            NAME TEXT,
            BRANCH TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS BOOKS(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            TITLE VARCHAR(50),
            AUTHOR TEXT,
            QUANTITY INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS BORROWED_BOOKS(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            USN VARCHAR(20),
            BOOK_ID INTEGER,
            BOOK_DATE TEXT,
            RETURN_DATE TEXT,
            STATUS TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS LIBRARY_VISITS(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            USN VARCHAR(20),
            ENTRY_TIME TEXT,
            EXIT_TIME TEXT,
            DURATION TEXT
        )
    `);

    // LIBRARIANS
    db.run(`
        INSERT OR IGNORE INTO LIBRARIANS(ID,NAME,EMAIL,PASSWORD)
        VALUES
        (1,'Pooja','pooja@nmamit.in','abc@123'),
        (2,'Ram','ram@nmamit.in','ahc@123'),
        (3,'Aditya','aditya@nmamit.in','abc@128'),
        (4,'Purvi','purvi@nmamit.in','abc@123'),
        (5,'Ananth','ananth@nmamit.in','ananth@123'),
        (6,'Shreya','shreya@nmamit.in','abc@183')
    `, (err) => {
        if (err) console.log(err);
    });

    // STUDENTS
    db.run(`
        INSERT OR IGNORE INTO STUDENTS(USN,NAME,BRANCH)
        VALUES
        ('NNM24CS156','Aditya','CSE'),
        ('NNM24CS157','Purvi','ECE'),
        ('NNM24CS158','Pooja','CSE'),
        ('NNM24CS153','Shreya','ISE'),
        ('NNM24CS159','Ananth','CSE'),
        ('NNM24CS155','Ram','CSE')
    `, (err) => {
        if (err) console.log(err);
    });

    // BOOKS
    db.run(`
        INSERT OR IGNORE INTO BOOKS(ID,TITLE,AUTHOR,QUANTITY)
        VALUES
        (1,'Pride and Prejudice','Jane Austen',5),
        (3,'Java Reference','Pearson',4),
        (4,'The Ramayana','Maharishi Valmiki',3)
    `, (err) => {
        if (err) console.log(err);
    });

    // BORROWED BOOKS
    db.run(`
        INSERT OR IGNORE INTO BORROWED_BOOKS
        (ID,USN,BOOK_ID,BOOK_DATE,RETURN_DATE,STATUS)
        VALUES
        (1,'NNM24CS156',1,'2026-06-25','2026-07-12','Borrowed'),
        (2,'NNM24CS157',3,'2026-11-28','2026-12-13','Borrowed'),
        (3,'NNM24CS158',4,'2026-08-20','2026-09-05','Borrowed')
    `, (err) => {
        if (err) console.log(err);
    });

});

module.exports = db;