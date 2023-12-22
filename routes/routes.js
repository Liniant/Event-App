const express = require("express");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const Event = require("../models/events");
const Join = require("../models/joinedevents");

//image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Insert an user into database route
router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
    const user = new User({
      name: req.body.first_name,
      surname: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword, // Store hashed password
      accesslevel: "alumni", // 
    });

    await user.save();

    req.session.message = {
      type: "success",
      message: "User added successfully!",
    };
    res.redirect("/Account/login");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

//Insert an user into database route
router.post("/adminuser", (req, res) => {
    const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        accesslevel: "admin",
    });
  user.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "success",
        message: "User added successfully!",
      };
      res.redirect("/Main/dashboard");
    }
  });
});

router.post("/adminuser", (req, res) => {
    console.log(req.body); // Log the form data to the console
    // Rest of your code
});


// User login route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch the user from the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Redirect based on the user's role
    if (user.accesslevel === "admin") {
      res.redirect("/Main/dashboard");
    } else if (user.accesslevel === "alumni") {
      res.redirect("/Main/index");
    } else {
      res.redirect("/Main/dashboard");
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Get all users  route
router.get("/Main/index", (req, res) => {
  Event.find().exec((err, events) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("Main/index", {
        title: "Dashboard",
        events: events,
      });
    }
  });
});
// Get all upcoming events route
router.get("/Main/upcomingevents", (req, res) => {
  Event.find().exec((err, events) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("Main/upcomingevents", {
        title: "Dashboard",
        events: events,
      });
    }
  });
});
// Edit event route
router.get("/Main/edit_event/:id", (req, res) => {
  let id = req.params.id;
  Event.findById(id, (err, event) => {
    if (err) {
      res.redirect("Main/dashboard");
    } else {
      if (event == null) {
        res.redirect("Main/dashboard");
      } else {
        res.render("Main/edit_event", {
          title: "Edit Event",
          event: event,
        });
      }
    }
  });
});
// Join event route
router.get("/Main/join_event/:id", (req, res) => {
  let id = req.params.id;
  Event.findById(id, (err, event) => {
    if (err) {
      res.redirect("Main/index");
    } else {
      if (event == null) {
        res.redirect("Main/index");
      } else {
        res.render("Main/join_event", {
          title: "Join Event",
          event: event,
        });
      }
    }
  });
});
// add joined event route

router.post("/joinuser", upload, (req, res) => {
  const join = new Join({
    catergory: req.body.catergory,
    name: req.body.name,
    description: req.body.description,
    organizer: req.body.organizer,
    eventdate: req.body.eventdate,
    venue: req.body.venue,
    time: req.body.time,
  });
  join.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "success",
        message: "Event Joined successfully!",
      };
      res.redirect("/Main/joined_events");
    }
  });
});
// Edit user route
router.get("/Main/edit_user/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) {
      res.redirect("Main/users");
    } else {
      if (user == null) {
        res.redirect("Main/users");
      } else {
        res.render("Main/edit_user", {
          title: "Edit User",
          user: user,
        });
      }
    }
  });
});
// Update user route
router.post("/update_user/:id", (req, res) => {
  let id = req.params.id;
  User.findByIdAndUpdate(
    id,
    {
      name: req.body.first_name,
      surname: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "User updated successfully!",
        };
        res.redirect("/Main/users"); // Redirect to the list of users
      }
    }
  );
});

//Insert a new event into database route
router.post("/addEvent", upload, (req, res) => {
  const event = new Event({
    catergory: req.body.catergory,
    name: req.body.name,
    organizer: req.body.organizer,
    description: req.body.description,
    eventdate: req.body.eventdate,
    venue: req.body.venue,
    time: req.body.time,
    image: req.file.filename,
  });
  event.save((err) => {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      req.session.message = {
        type: "success",
        message: "Event created successfully!",
      };
      //res.redirect("Main/dashboard");
      if (req.user.accesslevel === 'admin') {
                // Redirect to the admin dashboard's all events page
                res.redirect('/Main/dashboard');
            } else {
                // Redirect to the alumni dashboard
                res.redirect('Main/index');
            }
    }
  });
});
//dash board route
router.get("/Main/index", (req, res) => {
  res.render("Main/index", { title: "Dashboard" });
});

//get all events for admin
router.get("/Main/dashboard", (req, res) => {
  Event.find().exec((err, events) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("Main/dashboard", {
        title: "Dashboard",
        events: events,
      });
    }
  });
});
//get all  events for user
router.get("/Main/events", (req, res) => {
  Event.find().exec((err, events) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("Main/events", {
        title: "Dashboard",
        events: events,
      });
    }
  });
});
// update event route

router.post("/updateEvent/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";
  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }
  Event.findByIdAndUpdate(
    id,
    {
      catergory: req.body.catergory,
      name: req.body.name,
      description: req.body.description,
      organizer: req.body.organizer,
      eventdate: req.body.eventdate,
      venue: req.body.venue,
      time: req.body.time,
      image: new_image,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "Event updated successfully!",
        };
        res.redirect("/Main/dashboard");
      }
    }
  );
});
// Delete Event route
router.get("/delete_event/:id", (req, res) => {
  let id = req.params.id;
  Event.findByIdAndRemove(id, (err, result) => {
    if (result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "success",
        message: "Event deleted successfully!",
      };

      res.redirect("/Main/dashboard");
    }
  });
});
//get joined events for user
router.get("/Main/joined_events", (req, res) => {
  Join.find().exec((err, joined) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("Main/joined_events", {
        title: "Joined Events",
        joined: joined,
      });
    }
  });
});
// Delete user Event route
router.get("/delete_events/:id", (req, res) => {
  let id = req.params.id;
  Event.findByIdAndRemove(id, (err, result) => {
    if (result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "success",
        message: "Event deleted successfully!",
      };

      res.redirect("/Main/index");
    }
  });
});
// Delete user route
router.get("/delete_user/:id", (req, res) => {
  let id = req.params.id;
  User.findByIdAndRemove(id, (err, result) => {
    req.session.message = {
      type: "info",
      message: "User deleted successfully!",
    };

    res.redirect("/Main/users");
  });
});
router.get("/", (req, res) => {
  Event.find().exec((err, events) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("Home", {
        title: "Home: Welcome",
        events: events,
      });
    }
  });
});
//get all users
router.get("/Main/users", (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      // Filter out only alumni users
      const alumniUsers = users.filter((user) => user.accesslevel === "alumni");
      res.render("Main/users", {
        title: "Alumni Users",
        users: alumniUsers,
      });
    }
  });
});

//login user route
router.get("/Account/login", (req, res) => {
  res.render("Account/login", { title: "Login User" });
});
//add  user route
router.get("/Main/add_user", (req, res) => {
  res.render("Main/add_user", { title: "Add User" });
});
//create  user event route
router.get("/Main/event", (req, res) => {
  res.render("Main/event", { title: "Create Event" });
});
// logout route
router.get("/logout", (req, res) => {
  res.render("Account/login", { title: "Login User" });
});
//register user route
router.get("/Account/register", (req, res) => {
  res.render("Account/register", { title: "Register New User" });
});
//create event route
router.get("/Main/create_event", (req, res) => {
  res.render("Main/create_event", { title: "Create Event" });
});
router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

module.exports = router;
