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

app.listen(port,()=>{
console.log('Running on port ' + port );
});