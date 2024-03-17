import express from 'express';
import pg from 'pg';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;


app.get("/",(req,res) =>{
    res.render("loginpage.ejs");
});

app.listen(port,()=>{
console.log('Running on port ' + port );
});