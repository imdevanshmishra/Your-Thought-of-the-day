const express = require("express");
const app = express();
const multer = require('multer');
const port = 8080;
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require("method-override");
const upload = multer({ dest: 'uploads/' });

const mysql = require('mysql2');

const dbHost = 'localhost';
const dbUser = 'root';
const dbPassword = '224122';
const dbName = 'My_db';

// Create a connection to the database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "224122",
  database: "My_db"
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});



app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride("_method"));




// Create a table for posts if it doesn't exist
db.query(`CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255),
  content TEXT
)`, (err, results) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
  console.log('Table created successfully');
});


// Retrieve all posts from the database
app.get("/posts", (req, res) => {
  db.query('SELECT * FROM posts', (err, results) => {
    if (err) {
      console.error('Error retrieving posts:', err);
      res.status(500).send('Error retrieving posts');
      return;
    }
    res.render("index.ejs", { posts: results });
  });
});


app.get("/posts/new",(req,res)=>{
  res.render("new.ejs");
});

// Create a new post in the database
app.post("/posts", (req, res) => {
  let { username, content } = req.body;
  let id = uuidv4();
  db.query(`INSERT INTO posts (id, username, content) VALUES (?,?,?)`, [id, username, content], (err, results) => {
    if (err) {
      console.error('Error creating post:', err);
      res.status(500).send('Error creating post');
      return;
    }
    res.redirect("/posts");
  });
});

// Retrieve a single post from the database
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM posts WHERE id =?`, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving post:', err);
      res.status(404).send('Post not found');
      return;
    }
    res.render("show.ejs", { post: results[0] });
  });
});


// Retrieve a post for editing from the database
app.get("/posts/:id/edit", (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM posts WHERE id =?`, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving post:', err);
      res.status(404).send('Post not found');
      return;
    }
    res.render("edit.ejs", { post: results[0] });
  });
});


// Update a post in the database
app.patch("/posts/:id", (req, res) => {
  let { id } = req.params;
  let newContent = req.body.content;
  db.query(`UPDATE posts SET content =? WHERE id =?`, [newContent, id], (err, results) => {
    if (err) {
      console.error('Error updating post:', err);
      res.status(500).send('Error updating post');
      return;
    }
    res.redirect("/posts");
  });
});


// Delete a post from the database
app.delete("/posts/:id", (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM posts WHERE id =?`, [id], (err, results) => {
    if (err) {
      console.error('Error deleting post:', err);
      res.status(500).send('Error deleting post');
      return;
    }
    res.redirect("/posts");
  });
});

                                                                                  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});