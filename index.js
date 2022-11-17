const argon2 = require("argon2");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { User } = require("./model/user");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json())

const start = async () => {
  try {
    mongoose
      .connect("mongodb://0.0.0.0:27017/test")
      .catch((err) => console.log(err.reason));
    app.listen(3000, () => console.log("Server started on port 3000"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
/*
app.get("/:v/:test", (req, res) => {
    console.log(req.params.test);
    console.log(req.params.v);
    console.log(req.headers.test);
    return res.status(200).json({
        error: false,
        message: "Hello world"
    });
});   */

// evaluation nom,prenom, email, mot de passe et confirmer mdp

app.post("/register",async(req,res )=> {
      const body = req.body;
      if( body.nom.length <= 1){
          return res.status(401).json({
            error: true,
            message: "Nom incorrecte"
          })
      }
      if(body.prenom.length <= 1){
        return res.status(401).json({
          error: true,
          message: "Preom incorrecte"
        })
      }
      if(body.email.length <= 1){
        return res.status(401).json({
          error: true,
          message: "email incorrecte"
        })
      }
      
        if(body.password !== body.password2){
          return res.status(401).json({
            error: true,
            message: "pswd incorrecte"
          })
        }
        if(body.password.length <= 4){
          return res.status(401).json({
            error: true,
            message: "pswd incorrecte"
          })
      }
      const hash = await argon2.hash(body.password);
    

      const user = new User({
        nom : body.nom,
        prenom : body.prenom,
        email : body.email,
        password : hash
      })

      user.save()

      return res.status(200).json({
         error: false,
         user,
         hash
      })

})

app.post("/login",async(req,res )=> {

})

  // route à utiliser via un token bearer
app.get("/user",async(req,res )=> {

})

app.get("/users",async(req,res )=> {

})

app.put("/user",async(req,res )=> {

})

app.delete("/user/:id",async(req,res )=> {

})
/*
app.post("/user", async (req, res) => {
console.table(req.body);
     const user = new User({
            nom: req.body.nom,
            email: req.body.email,
            prenom: req.body.prenom
  });
  console.log(user);

  await user.save();

  return res.status(200).json({
    error: false,
    message: "Hello world",
  });
});   */
