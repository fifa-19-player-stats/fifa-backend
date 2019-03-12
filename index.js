const express = require("express");
const helmet = require("helmet");
const knex = require("knex");
const dbConfig = require("./knexfile");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const server = express();
const db = knex(dbConfig.development);

server.use(cors());
server.use(express.json());
server.use(helmet());
server.set("port", process.env.PORT || 8000);

/////////////////////////////////////////////////////////////////////
// Load player data from json file
/////////////////////////////////////////////////////////////////////
// let data = JSON.parse(fs.readFileSync("PlayerInfo.json", "utf8"));
// let errors = [];
// for (let i = 0; i < data.data.length; i++) {
//   delete data.data[i]["Unnamed: 0"];
//   db("players")
//     .insert(data.data[i])
//     .then(res => {})
//     .catch(err => {
//       //console.log(err);
//     });
//   if (i === data.data.length - 1) console.log("done");
// }

const secret = process.env.SECRET;

function generateToken(user) {
  const payload = {
    username: user.username,
    department: user.department
  };

  const options = {
    expiresIn: "1hr",
    jwtid: "12345"
  };

  return jwt.sign(payload, secret, options);
}

function protected(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "You shall not pass!" });
      } else {
        req.user = { username: decodedToken.username };

        next();
      }
    });
  } else {
    res.status(401).json({ message: "no token provided" });
  }
}

server.get("/api/users", protected, (req, res) => {
  db("users")
    .select("username", "id")
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      console.error(err);
    });
});

server.post("/api/register", (req, res) => {
  let user = req.body;
  user.password = bcrypt.hashSync(user.password, 8);
  console.log("called register");
  db("users")
    .insert(user)
    .then(ids => {
      id = ids[0];
      console.log("inserted");
      db("users")
        .where({ id: id })
        .first()
        .then(user => {
          const token = generateToken(user);
          res.status(201).json({ id: user.id, token });
        })
        .catch(err => {
          console.log("inner", err);
          res.status(500).json(err);
        });
    })
    .catch(err => {
      console.log("outer", err);
      res.status(500).json(err);
    });
});

server.post("/api/login", (req, res) => {
  const creds = req.body;

  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(err => res.status(500).json(err));
});

server.get("/", (req, res) => {
  res.status(200).json("API is running");
});

server.get("/api", protected, (req, res) => {
  db.select("name", "id", "position")
    .from("players")
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

server.listen(server.get("port"), () => {
  console.log("== LISTENING ON PORT", server.get("port"), "==");
});
