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
// Load player data from json files
/////////////////////////////////////////////////////////////////////
// let data = JSON.parse(fs.readFileSync(`./data/FIFA_Similarity.json`, "utf8"));

// let players = data.data;
// for (let i = 13500; i < players.length; i++) {
//   let newData = {
//     id: players[i].id,
//     index: players[i].index,
//     name: players[i].name,
//     club: players[i].club,
//     position: players[i].position,
//     similar1: players[i].fiveMostSimilar[0],
//     similar2: players[i].fiveMostSimilar[1],
//     similar3: players[i].fiveMostSimilar[2],
//     similar4: players[i].fiveMostSimilar[3],
//     similar5: players[i].fiveMostSimilar[4]
//   };

//   db("similarity")
//     .insert(newData)
//     .then(res => {
//       if (i === players.length - 1) console.log("done");
//     })
//     .catch(err => {
//         console.log(err);
//     });
// }

// Loads secret key fron .env file
const secret = process.env.SECRET;

// Create JWT upon login
function generateToken(user) {
  const payload = {
    username: user.username,
    department: user.department
  };

  const options = {
    expiresIn: "1hr",
    jwtid: "12345"
  };

  if (secret) return jwt.sign(payload, secret, options);
  return null;
}

// Protected middleware. Verifies JWT upon protected endpoint access
function protected(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        if (err.name == "TokenExpiredError") {
          res.status(401).json({ message: "Token has expired", error: err });
        } else {
          res.status(401).json({ message: "Bad token", error: err });
        }
      } else {
        req.user = { username: decodedToken.username };

        next();
      }
    });
  } else {
    res.status(401).json({ message: "no token provided" });
  }
}

// Basic call, verifies API is up and running
server.get("/", (req, res) => {
  res.status(200).json("API is running");
});

// Pulls player name, id, and position
server.get("/api/players", protected, (req, res) => {
  db("players")
    .select("name", "id", "position")
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err);
      console.error(err);
    });
});

// Get all stats on player with the id indicated in the url
server.get("/api/players/:id", protected, (req, res) => {
  db("players")
    .where({ id: req.params.id })
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err);
      console.error(err);
    });
});

// Get list of all players name, id, and position by team
server.get("/api/team", protected, (req, res) => {
  if (!req.body.team) {
    res.status(404).json({ message: "Missing team name" });
  } else {
    db("players")
      .where({ club: req.body.team })
      .select("name", "id", "position")
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

// Get list of all players name, id, and position by nationality
server.get("/api/nation", protected, (req, res) => {
  if (!req.body.nation) {
    res.status(404).json({ message: "Missing country name" });
  } else {
    db("players")
      .where({ nationality: req.body.nation })
      .select("name", "id", "position")
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

// Get list of player score and rank by position
server.get("/api/ranking", protected, (req, res) => {
  let position = req.body.position.toUpperCase();

  db.select(
    `${position}.id`,
    `${position}.score`,
    `${position}.rank`,
    "players.name"
  )
    .from(position)
    .innerJoin("players", `${position}.id`, "players.id")
    .then(data => {
      data.sort((a, b) => {
        if (a.rank < b.rank) return -1;
        if (a.rank > b.rank) return 1;
        return 0;
      });
      res.status(200).json(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Get list of players most similar to player indicated by id
server.get("/api/similar/:id", protected, (req, res) => {
  let id = req.params.id;
  db("similarity")
    .where({ id })
    .then(data => {
      if (data.length === 0)
        res.status(404).json({ message: "Player not found" });
      else res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// Registers new user. Request body must contain a unique username and a
// password. Returns a signed JWT
server.post("/api/register", (req, res) => {
  let user = req.body;
  user.password = bcrypt.hashSync(user.password, 8);

  // Check for secret key, valid username, and valid password before
  // inserting new user
  if (!secret) {
    res.status(400).json({ message: "Missing secret key" });
  } else if (user.username.length < 3 || !user.username) {
    res
      .status(400)
      .json({ message: "Username must be at least 3 characters long" });
  } else if (user.password.length < 8 || !user.username) {
    res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  } else {
    db("users")
      .where({ username: user.username })
      .then(names => {
        // If username doesn't exist insert new user and return a signed JWT
        if (names.length === 0) {
          db("users")
            .insert(user)
            .then(ids => {
              const id = ids[0];

              db("users")
                .where({ id: id })
                .first()
                .then(user => {
                  const token = generateToken(user);
                  res
                    .status(201)
                    .json({ id: user.id, token, username: user.username });
                })
                .catch(err => {
                  res.status(500).json(err);
                });
            })
            .catch(err => {
              res.status(500).json(err);
            });
        } else {
          res
            .status(400)
            .json({ message: "The username has already been used" });
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json(err);
      });
  }
});

// Login user. Request body must contain username and password
server.post("/api/login", (req, res) => {
  const creds = req.body;

  if (!creds.username || !creds.password) {
    res.status(400).json({ message: "Both username and password required" });
  } else {
    db("users")
      .where({ username: creds.username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(creds.password, user.password)) {
          const token = generateToken(user);

          if (token) res.status(200).json({ token, username: user.username });
          else res.status(401).json({ message: "Unauthorized login attempt" });
        } else {
          res.status(400).json({ message: "Incorrect username or password" });
        }
      })
      .catch(err => res.status(500).json(err));
  }
});

// Change password. Request body must contain username, old password,
// and new password. New password must be at least 8 characters
server.put("/api/passchange", protected, (req, res) => {
  let creds = req.body;

  if (!creds.username || !creds.oldPassword || !creds.newPassword) {
    res
      .status(400)
      .json({ message: "Both username and old and new password required" });
  } else if (creds.newPassword.length < 8) {
    res
      .status(400)
      .json({ message: "New password must be at least 8 characters long" });
  } else {
    db("users")
      .where({ username: creds.username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(creds.oldPassword, user.password)) {
          let newPass = bcrypt.hashSync(creds.newPassword, 8);
          db("users")
            .where({ username: user.username })
            .update({ password: newPass })
            .then(() => {
              res.status(200).json({ message: "Password updated" });
            })
            .catch(err => {
              console.log("inner", err);
              res.status(500).json(err);
            });
        } else {
          res.status(400).json({ message: "Incorrect username or password" });
        }
      })
      .catch(err => {
        console.log("outer", err);
        res.status(500).json(err);
      });
  }
});

// Delete user. Request body must contain username and password
server.delete("/api/userdel", protected, (req, res) => {
  const creds = req.body;

  if (!creds.username || !creds.password) {
    res.status(400).json({ message: "Both username and password required" });
  } else {
    db("users")
      .where({ username: creds.username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(creds.password, user.password)) {
          db("users")
            .where({ username: creds.username })
            .del()
            .then(deleted => {
              if (deleted > 0)
                res.status(200).json({ message: "User deleted" });
              else res.status(404).json({ message: "User not found" });
            });
        } else {
          res.status(400).json({ message: "Incorrect username or password" });
        }
      })
      .catch(err => res.status(500).json(err));
  }
});

server.listen(server.get("port"), () => {
  console.log("== LISTENING ON PORT", server.get("port"), "==");
});
