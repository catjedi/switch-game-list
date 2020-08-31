const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const Game = require("./models/gamelist");
const User = require("./models/user");

mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost/switch_games", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

// Passport configuration
app.use(require("express-session")({
  secret: "a secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("homepage.ejs");
});

app.get("/gamelist", (req, res) => {
  // Get the switch games for the gamelist from a database
  Game.find({}, (err, allGames) => {
    if (err) {
      console.log(err);
    } else {
      res.render("gamelist.ejs", { games: allGames });
    }
  });
});

app.get("/gamelist/new", (req, res) => {
  res.render("new.ejs");
});

app.get("/gamelist/:id", (req, res) => {
  // Find a specific game from the gamelist based on a provided ID
  Game.findById(req.params.id, (err, foundGame) => {
    if (err) {
      console.log(err);
    } else {
      res.render("description.ejs", { game: foundGame });
    }
  });
});

app.post("/gamelist", (req, res) => {
  // Get the data from the form and add it to the gamelist array
  let name = req.body.name;
  let image = req.body.image;
  let description = req.body.description;
  let newGame = { name: name, image: image, description: description };

  // Create a new game to add and save it to the database
  Game.create(newGame, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      // Redirect the current route back to the gamelist page
      res.redirect("/gamelist");
    }
  });
});

// Show register form
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Handle the sign up logic
app.post("/register", (req, res) => {
  let newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
    }
    passport.authenticate("local")(req, res, () => {
      res.redirect("/gamelist");
    });
  });
});

// Show the login form
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Handling the login logic
app.post("/login", passport.authenticate("local",
  { successRedirect: "/gamelist", failureRedirect: "/gamelist" }
), (req, res) => {
});

// Being able to log the user out from the website
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/gamelist");
})

// Edit the content of a game: name, image url, and description
app.get("/gamelist/:id/edit", (req, res) => {
  Game.findById(req.params.id, (err, foundGame) => {
    if (err) {
      console.log(err);
    } else {
      res.render("edit.ejs", { game: foundGame });
    }
  });
});

// Update the contents of an edited game
app.put("/gamelist/:id", (req, res) => {

  // Find and update the correct game in the list
  // then redirect back to the gamelist page
  Game.findByIdAndUpdate(req.params.id, req.body.game, (err, updatedGame) => {
    if (err) {
      res.redirect("/gamelist");
    } else {
      res.redirect("/gamelist/" + req.params.id);
    }
  });
});

// Route that will enable user to delete a game from the list
app.delete("/gamelist/:id", (req, res) => {
  Game.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      res.redirect("/gamelist");
    } else {
      res.redirect("/gamelist");
    }
  });
});

app.listen(3000);
