const sqlite3 = require('sqlite3');

const db = new sqlite3.Database("library.db",(err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Connected to database');
    }
});

db.serialize(()=>{

db.run(
    `CREATE TABLE IF NOT EXISTS LIBRARIANS(
       ID INTEGER PRIMARY KEY AUTOINCREMENT,
       NAME TEXT,
       EMAIL VARCHAR(15),
       PASSWORD VARCHAR(10)
)`,
    (err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('LIBRARIANS Table created successfully');
        }
    })

    db.run(
    `CREATE TABLE IF NOT EXISTS STUDENTS(
       USN PRIMARY KEY ,
       NAME TEXT,
       BRANCH TEXT
)`,
    (err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('STUDENTS Table created successfully');
        }
    })

    db.run(
    `CREATE TABLE IF NOT EXISTS BOOKS(
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      TITLE VARCHAR(20),
      AUTHOR TEXT,
      QUANTITY INTEGER
)`,
    (err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('BOOKS Table created successfully');
        }
    })

    db.run(
    `CREATE TABLE IF NOT EXISTS BORROWED_BOOKS(
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      USN VARCHAR(10),
      BOOK_ID INTEGER,
      BOOK_DATE TEXT,
      RETURN_DATE TEXT,
      STATUS TEXT
)`,
    (err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('BORROWED_BOOKS Table created successfully');
        }
    })

    db.run(
    `CREATE TABLE IF NOT EXISTS LIBRARY_VISITS(
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      USN VARCHAR(10),
      ENTRY_TIME TEXT,
      EXIT_TIME TEXT,
      DURATION TEXT
)`,
    (err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('LIBRARY_VISITS Table created successfully');
        }
    })

    db.run(`
    INSERT OR IGNORE INTO LIBRARIANS(ID,NAME,EMAIL,PASSWORD)
    VALUES(1,'Pooja','pooja@nmamit.in','abc@123'),
    (2,'Ram','ram@nmamit.in','ahc@123'),
    (3,'Aditya','aditya@nmamit.in','abc@128'),
    (4,'Purvi','purvi@nmamit.in','abc@123'),
    (5,'Ananth','ananth@nmamit.in','ananth@123'),
    (6,'Shreya','shreya@nmamit.in','abc@183')
`),
(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('Inserted successfully');
        }
    }

    db.all(`SELECT * FROM LIBRARIANS`,(err,rows)=>{
    if(err){
        console.log(err);
    }else{
        console.log('\nAll Librarians');
        console.table(rows);
    }
})


   db.run(`
    INSERT OR IGNORE INTO STUDENTS(USN,NAME,BRANCH)
    VALUES('NNM24CS156','Aditya','CSE'),
    ('NNM24CS157','Purvi','ECE'),
    ('NNM24CS158','Pooja','CSE'),
    ('NNM24CS153','Shreya','ISE'),
    ('NNM24CS159','Ananth','CSE'),
    ('NNM24CS155','Ram','CSE')
`),
(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('Inserted successfully');
        }
    } 

     db.all(`SELECT * FROM STUDENTS`,(err,rows)=>{
    if(err){
        console.log(err);
    }else{
        console.log('\nAll Students');
        console.table(rows);
    }
})

   db.run(`
    INSERT OR IGNORE INTO BOOKS(ID,TITLE,AUTHOR,QUANTITY)
    VALUES('3','Java Reference','Pearson',4),
    ('4','The Ramayana','Maharishi Valmiki',3),
    ('1','Pride and Prejudice','Jane Austen',5)
`),
(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('Inserted successfully');
        }
    } 

     db.all(`SELECT * FROM BOOKS`,(err,rows)=>{
    if(err){
        console.log(err);
    }else{
        console.log('\nAll Books');
        console.table(rows);
    }
})

  db.run(`
INSERT OR IGNORE INTO BORROWED_BOOKS
(ID,USN,BOOK_ID,BOOK_DATE,RETURN_DATE)
VALUES
(1,'NNM24CS156',1,'2026-06-25','2026-07-12'),
(2,'NNM24CS157',3,'2026-11-28','2026-12-13'),
(3,'NNM24CS158',4,'2026-08-20','2026-09-05')
`),
(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log('Inserted successfully');
        }
    } 

     db.all(`SELECT * FROM BORROWED_BOOKS`,(err,rows)=>{
    if(err){
        console.log(err);
    }else{
        console.log('\nAll Borrowed books');
        console.table(rows);
    }
})

    });

    module.exports = db;