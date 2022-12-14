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

  // Création de compte à l'aide de l'insertion des données (nom,prenom,email,phone et mdp)

app.post("/api/auth/register", async (req, res) => {
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
  if (body.phone.length <= 1) {
    return res.status(401).json({
      error: true,
      message: "Veuillez saisir votre numéro !"
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
    phone: body.phone,
    password: hash
  })

  user.save()

  return res.status(201).json({
    user : {
      nom : user.nom,
      prenom : user.prenom,
      phone : user.phone,
      email : user.email
   },
    message : "Utilisateur créér avec succès !"
  })

})
  // Authentification à l'aide du email + mdp et creation du Token
app.post("/api/auth/login", async (req, res) => {
    const body = req.body;
    if (body.email.length <= 1) {
      return res.status(401).json({
        message: "Veuillez entrer votre E-mail !"
      })
    }
    if (body.password.length <= 4) {
      return res.status(401).json({
        message: "Votre mot de passe doit posseder plus de 4 caractères !"
      })
    }

    const user = await User.findOne({
        email : body.email
    })

    if(!user){
      return res.status(401).json({
          message : "Utilisateur Introuvable ! Créér votre compte d'abord !"
      })
    }
    const password = await argon2.verify(user.password, body.password);
    if (!password){
        return res.status(401).json({
          message : "mot de passe incorrecte :!"
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
         email : user.email,
         nom : user.nom,
         prenom : user.prenom,
         phone : user.phone
      },
      message : "Connexion réussie ! "
    })
    
})
    // afficher le profil connecté à l'aide du TOKEN
app.get("/api/user/profile",checkJwt,async(req,res)=>{
     const user = await User.findOne({
        email : res.locals.jwtPayload.email,
    }) 
    // au cas ou on a supprimé le mail

    if(email == ""){
  
      return res.status(500).json({
        message : "Veuillez  vous connectez d'abord ! "
      })
    }
    res.status(200).json({
      user : {
         nom : user.nom,
         prenom : user.prenom,
         phone : user.phone,
         email : user.email
      },
      message : "Profil Trouvé ! "
    })
 })

  // Modification des information nom,prenom 
 // on récupere l'user connecté grace au jeton et on modifie le nom + prenom
app.put("/api/user/edit", checkJwt , async (req, res) => {

  const user = await User.findOne({
     email : res.locals.jwtPayload.email 
  }) ;
  user.prenom = req.body.prenom || user.prenom;
  user.nom = req.body.nom || user.nom;
  
  await user.save();
   
  res.status(201).json({
    user : {
       email : user.email,
       nom : user.nom,
       prenom : user.prenom,
       phone : user.phone
    },
    message : "Modification du compte réussie ! "
  })
   
  })
  
  // Modification du mot de passe
 // on récupere l'user connecté grace au jeton et on modifie le mot de passe
  app.put("/api/user/edit-password", checkJwt , async (req, res) => {
    const user = await User.findOne({
       email : res.locals.jwtPayload.email 
    }) ;

    if (req.body.password !== req.body.password2) {
      return res.status(401).json({
        error: true,
        message: "Mot de passe non identique !"
      })
    }
    
    const hash = await argon2.hash(req.body.password);
    user.password = hash;
    await user.save();

     
    res.status(201).json({
      message : "Mot de passe modifié ! "
    })
     
    })
  
    
  // Modification des information phone
 // on récupere l'user connecté grace au jeton et on modifie le numero de tel
    app.put("/api/user/edit-phone", checkJwt , async (req, res) => {

      const user = await User.findOne({
         email : res.locals.jwtPayload.email 
      }) ;
      user.phone = req.body.phone || user.phone;
      
      await user.save();
       
      res.status(201).json({
      
        message : "Numéro de téléphone modifié ! "
      })
       
      })
      
  // Modification des information mail
 // on récupere l'user connecté grace au jeton et en modifiant le mail
    
      app.put("/api/user/edit-email", checkJwt , async (req, res) => {
        if( req.body.email == ""){
            return res.status(500).json({
               message : "Veuillez entrer votre email svp"
            });
        }
        const user = await User.findOne({
           email : res.locals.jwtPayload.email 
        }) ;
        user.email = req.body.email;
        
        await user.save();
         
        res.status(201).json({
        
          message : "Email modifié avec succès ! "
        })
         
        })
 
           
  //Suppresion de user
 // on récupere l'user connecté grace au jeton et on modifie le supprime
app.delete("/api/user/delete",checkJwt, async (req, res) => {
  await User.findOneAndRemove (res.locals.jwtPayload.email)
  .then(function (user) {
      res.status(200).json({
        message : " Votre profil à été supprimé avec succès ! un Email de confirmation de suprresion vous a été envoyé "
      });
  })
  .catch(function (error) {
      res.status(500).json(error);
  });
})

