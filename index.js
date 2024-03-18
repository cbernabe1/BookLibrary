import express from 'express';
import pg from 'pg';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    password: "localhost",
    database: "booklibrary",
    password: "pg123",
    port: 5432
});
db.connect();
const currentUser = [];
const date = new Date().toJSON();
let books = [];
app.get("/",(req,res) =>{
    res.render("loginpage.ejs");
});

app.get("/signup",(req,res)=>{
    res.render("signuppage.ejs");
});

app.post("/register", async(req,res)=>{
const email = req.body.email;
const password = req.body.password;
try {
    const check = await db.query("SELECT email FROM users WHERE email = $1",[email]);
    if(check.rowCount === 0){
    const result = await db.query("INSERT INTO users (email,password) VALUES ($1,$2)",[email,password]);
    if(result.rowCount === 1){
        res.redirect("/");
    }
    else{
        res.render("signuppage.ejs",{error: "Error inserting the account."})
    }
}else{
    res.render("signuppage.ejs",{error: "Email is already existed."})
}
} catch (error) {
    console.log(error);
}
});

app.post("/login", async(req,res)=>{
try {
    const email = req.body.emailfield;
    const password = req.body.passwordfield;
    const result = await db.query("SELECT * FROM users WHERE email = $1 AND password = $2",[email,password]);
    
    currentUser.push(result.rows[0]);
    if(result.rowCount === 1){
        const fetchbooks = await db.query("SELECT * FROM books WHERE user_id = $1",[result.rows[0].id])
        fetchbooks.rows.forEach((book) =>{
            books.push(book);
        });
        res.render("homepage.ejs",{username: email, books: books});
    }else{
        res.redirect("/");
    }
} catch (error) {
    console.log(error);
}
});

app.get("/addpage",(req,res)=>{
    res.render("addbook.ejs");
});

async function getBooks(){
try {
    const fetchbooks = await db.query("SELECT * FROM books WHERE user_id = $1",[currentUser[0].id]);
    fetchbooks.rows.forEach((book) =>{
        books.push(book);
        console.log(book.name);
    });
} catch (error) {
    console.log(error);
}
}
 
app.post("/addbook",async(req,res)=>{
    try {
        const name = req.body.name;
        const description = req.body.description;
        const author = req.body.author;
        const result = await db.query("INSERT INTO books (name,description,author,user_id,date_added) VALUES ($1,$2,$3,$4,$5)",[name,description,author,currentUser[0].id,date]);
        if(result.rowCount === 1){
            books = [];
            getBooks();
            console.log("current User: " + currentUser);
            console.log("Books: " + books);
            res.render("homepage.ejs",{username: currentUser[0].email,books: books});
        }else{
            console.log("Failed to add book.")
        }
    } catch (error) {
        console.log(error);
    } 
});
 
app.listen(port,()=>{
console.log('Running on port ' + port );
});