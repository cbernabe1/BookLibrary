import express from 'express';
import pg from 'pg';
import bodyParser from 'body-parser';
import axios from 'axios';
const app = express();
const port = 3000;
const API_URL = "https://openlibrary.org/search.json";

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
let currentUser = [];
const date = new Date().toJSON();

app.get("/",(req,res) =>{
    currentUser = [];
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
    console.log(currentUser);
    if(result.rowCount === 1){
        const book = await getBooks();
        res.render("homepage.ejs",{username: email, books: book});
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
    let books = [];
    const fetchbooks = await db.query("SELECT * FROM books WHERE user_id = $1",[currentUser[0].id]);
    fetchbooks.rows.forEach((book) =>{
        books.push(book);
    });
    return books;
} catch (error) {
    console.log(error);
}
}
 
app.post("/addbook",async(req,res)=>{
    try {
        const name = req.body.name;
        const description = req.body.description;
        const author = req.body.author;
        const rating = req.body.rating;
        const result = await db.query("INSERT INTO books (name,description,author,user_id,date_added) VALUES ($1,$2,$3,$4,$5,$6)",[name,description,author,currentUser[0].id,date,rating]);
        if(result.rowCount === 1){
            const book = await getBooks();
            res.render("homepage.ejs",{username: currentUser[0].email,books: book});
        }else{
            console.log("Failed to add book.")
        }
    } catch (error) {
        console.log(error);
    } 
});
 
app.post("/edit",async(req,res)=>{
   try {
    console.log(req.body.edit);
    const result = await db.query("SELECT * FROM books WHERE id = $1",[req.body.edit]);
    res.render("editbook.ejs",{edit: result.rows[0]});
   } catch (error) {
    console.log(error);
   }
});

app.post("/editbook",async(req,res)=>{
try {
    const name = req.body.name;
    const description = req.body.description;
    const author = req.body.author;
    const id = req.body.id;
    console.log(name,description,author,id);
    const result = await db.query("UPDATE books SET name = $1, description = $2, author = $3 WHERE id = $4",[name,description,author,id]);
    const book = await getBooks();
    res.render("homepage.ejs",{username: currentUser[0].email,books: book});
} catch (error) {
    console.log(error);
}
}); 

app.post("/delete",async(req,res)=>{
try {
    const result = await db.query("DELETE FROM books WHERE id = $1",[req.body.delete]);
    const book = await getBooks();
    res.render("homepage.ejs",{username: currentUser[0].email,books: book});
} catch (error) {
    console.log(error);
}
});

app.post("/get-details",async(req,res)=>{
try {
    const response = await axios.get(API_URL+"?q="+req.body.name);
    console.log(response);
} catch (error) {
    console.log(error)
}
});
 
app.listen(port,()=>{
console.log('Running on port ' + port );
});