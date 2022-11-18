const argon2 = require("argon2");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { User } = require("./model/user");
var jwt = require('jsonwebtoken');
const  checkJwt  = require("./middlewares/checkjwt");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

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

app.post("/register", async (req, res) => {
  const body = req.body;
  if (body.nom.length <= 1) {
    return res.status(401).json({
      error: true,
      message: "Veuillez saisir votre nom"
    })
  }
  if (body.prenom.length <= 1) {
    return res.status(401).json({
      error: true,
      message: "Veuillez saisir votre prenom"
    })
  }
  if (body.email.length <= 1) {
    return res.status(401).json({
      error: true,
      message: "Veuillez saison votre E-mail"
    })
  }

  if (body.password !== body.password2) {
    return res.status(401).json({
      error: true,
      message: "Mot de passe non identique !"
    })
  }
  if (body.password.length <= 4) {
    return res.status(401).json({
      error: true,
      message: "Votre mot de passe doit posseder plus de 4 caractères ! "
    })
  }
  const hash = await argon2.hash(body.password);


  const user = new User({
    nom: body.nom,
    prenom: body.prenom,
    email: body.email,
    password: hash
  })

  user.save()

  return res.status(200).json({
    error: false,
    user,
    hash
  })

})

app.post("/login", async (req, res) => {
    const body = req.body;
    if (body.email.length <= 1) {
      return res.status(401).json({
        error: true,
        message: "Veuillez entrer votre E-mail !"
      })
    }
    if (body.password.length <= 4) {
      return res.status(401).json({
        error: true,
        message: "Votre mot de passe doit posseder plus de 4 caractères !"
      })
    }

    const user = await User.findOne({
        email : body.email
    })

    if(!user){
      return res.status(401).json({
          error : true,
          message : "Utilisateur Introuvable ! Créér votre compte d'abord !"
      })
    }
    const password = await argon2.verify(user.password, body.password);
    if (!password){
        return res.status(401).json({
          error : true,
          message : "mdp incorrecte :!"
        })
    }
      //user.password = undefined;

    const token = jwt.sign({
        id : user._id,
        email : body.email
    },'secret',{
      expiresIn : '1h'
    })
    res.cookie("token", token, {
      httpOnly: true,
    })

    res.status(200).json({
      user : {
         nom : user.nom,
         prenom : user.prenom,
         email : user.email
      },
      message : "Authentification réussie ! "
    })
    
})

app.get("/api/user/profile",checkJwt,async(req,res)=>{
     const user = await User.findOne({
        email : res.locals.jwtPayload.email
    }) 

    res.status(200).json({
      user : {
         nom : user.nom,
         prenom : user.prenom,
         email : user.email
      },
      message : "Profil Trouvé ! "
    })
 })

app.get("/email/:email", async (req, res) => {
  var params = req.params;

  const users = await User.find({
    email: params.email
  }).select('-__v')

  //console.log(params)
  return res.status(200).json({
    error: false,
    users
  })
})

app.get("/nom/:nom", async (req, res) => {
  var params = req.params;

  const users = await User.find({
    nom: params.nom

  })
  //console.log(params)
  return res.status(200).json({
    error: false,
    users
  })
})

app.get("/prenom/:prenom", async (req, res) => {
  var params = req.params;

  const users = await User.find({
    prenom: params.prenom

  })
  //console.log(params)
  return res.status(200).json({
    error: false,
    users
  })
})

// route à utiliser via un token bearer
app.get("/user", async (req, res) => {
  var params = req.params;

  const user = await User.find({
      email: params.email
  })
  return res.status(200).json({
    error: false,
  })
})

app.get("/users",  (req, res) => {
  User.find().then(function (users) {
    res.status(200).json(users);
  }).catch(function (error){
    res.status(500).json({
      error : error
    });
  }) 
})

app.put("/user", async (req, res) => {
  const password = await argon2.hash(req.body.password)

    User.findByIdAndUpdate(req.params.id,{
        prenom: req.body.prenom,
        nom : req.body.nom,
        email : req.body.email,
        password : password
    }).then(function(user){
        res.status(200).json(user);
    })
    .catch(function (error) {
      res.status(500).json(error);
  });
})

app.delete("/user/:id", async (req, res) => {
  User.findByIdAndRemove(req.params.id)
  .then(function (user) {
      res.status(200).json(user);
  })
  .catch(function (error) {
      res.status(500).json(error);
  });
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
