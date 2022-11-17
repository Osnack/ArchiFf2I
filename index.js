const { argon2d } = require("argon2");
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

app.get("/:v/:test", (req, res) => {
    console.log(req.params.test);
    console.log(req.params.v);
    console.log(req.headers.test);
    return res.status(200).json({
        error: false,
        message: "Hello world",
    });
});

app.post("/user", async (req, res) => {
console.table(req.body);
const hash = await argon2.hash(req.body.mdp)
     const user = new User({
            nom: req.body.nom,
            email: req.body.email,
            prenom: req.body.prenom,
            mdp: hash
  });
  console.log(user);

  await user.save();

  return res.status(200).json({
    error: false,
    message: "Hello world",
  });
});
