const { faker } = require('@faker-js/faker');
const mysql = require(`mysql2`);
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");


app.use(methodOverride("_method")); // for PUT and DELETE requests
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set("views",path.join(__dirname,"/views"));

const connection = mysql.createConnection({
  host: 'localhost',        
  user :'root',
  database: 'delta_app',
  password : `aryan12345`
});

let  getRandomUser = () => {
  return [
    faker.datatype.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//  // inserting 100 random users
// let q =" INSERT INTO user (id,username,email,password) VALUES  ?  ";
 
// let data =[];
// for(let i=1;i<=100;i++){
//   data.push(getRandomUser());   // 100 random users
// }

// home route 
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

//           show route
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let data = result;
      res.render("showusers.ejs", { data });
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

//   Edit route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

//   UPDATE ROUTE
app.patch("/user/:id",(req,res)=>{
   let { id } = req.params;
   let { password: formPass, username: newuser} = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if(formPass != user.password){
          res.send("password is not correct");
      }
       
         else {
        let q2 = `UPDATE user SET username='${newuser}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
      // res.render("edit.ejs", { user });
      
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

// ADD USER ROUTE

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

const { v4: uuidv4 } = require('uuid');
app.post("/user/new", (req, res) => {
  
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q3  = `INSERT INTO user (id, username, email, password) 
  VALUES
   ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q3, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});



//   delete rought
app.get("/user/:id/delete", (req, res) => 
  {
   let {id}=req.params;
   let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
  });

app.delete("/user/:id",(req,res)=>{
  let { id } = req.params;
  let {password} =req.body;
  let q2 = `SELECT * FROM user WHERE id='${id}'`;
   try{
    connection.query(q2,(err,result)=>{
      if(err)throw err;
      let user = result[0];
      if(password != user.password){
        res.send("password is not correct");
      }
      else{
        let q3=`DELETE FROM user WHERE id='${id}'`;
        connection.query(q3,(err,result)=>{
          if(err)throw err;
          else{
        console.log(result);
        console.log("deleted user");
        res.redirect("/user");
      }
        })
      }
       
    });
   }
   catch(err){
    res.send("some error with DB");
   }
});


// feedback rought

app.get("/user/:id/feedback",(req,res)=>{
  let { id }= req.params;
  let q =`SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if (err) throw err;
      let user = result[0];
      res.render("feedback.ejs",{user});
    });
    
  }
   catch(err){
      res.send("some error in DB");
    }
});

  // upar require kar lena

app.post("/user/:id/feedback", (req, res) => {
  let { id } = req.params;
  let { feed } = req.body;
  let feedbackId = uuidv4(); // generate unique feedback id

  let q4 = `INSERT INTO feedback (id, feed, user_id) VALUES ('${feedbackId}', '${feed}', '${id}')`;

  try {
    connection.query(q4, (err, result) => {
      if (err) throw err;
      console.log("feedback added");

      // fetch all feedbacks to show in table
      let q = "SELECT * FROM feedback";
      connection.query(q, (err, feedbacks) => {
        if (err) throw err;
        res.render("feedbacks.ejs", { feedbacks });
      });
    });
  } catch (err) {
    res.send("some error occurred");
  }
});
 

//     FEEDBACK DELETER
 
 app.delete("/feedback/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = "DELETE FROM feedback WHERE id = ?";

  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error("Error deleting feedback:", err);
      return res.send("Error while deleting feedback");
    }

    console.log("Feedback deleted successfully");
    res.redirect("/user"); // ya jis page pe feedbacks show kar rahe ho
  });
});

 

  app.listen("8080",()=>{
   console.log("server is listining to the port 8080"); 
 });

 