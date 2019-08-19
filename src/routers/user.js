const express = require("express");
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account');
const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }

  /*   user.save().then(() => {
        res.send(user);
        console.log(req.body);
    }).catch((error) => {
        res.status(400).send(error);
    }); */
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    /* const data = jwt.fy(token, 'this is me'); */
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//logout from only one session
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//logout from all the sessions
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// auth middleware was set to run with this specific route (2nd arg), and router handler as 3rd arg
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

/* router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
}); */

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every(item => allowedUpdates.includes(item));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    /* const user = await User.findById(req.user._id); */
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();

   /*  if (!user) {
      return res.status(404).send();
    } */
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    /* const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).send();
    } */
    sendCancelationEmail(req.user.email, req.user.name);
    await req.user.remove();
    
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});


const upload = multer({
    limits: {
      fileSize: 1000000
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Please upload an image!'));
      }

      cb(undefined, true);
    }
});

// upload.single() is a middleware
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);

    } catch(error) {
        res.status(404).send();
    }
}), 

module.exports = router;
