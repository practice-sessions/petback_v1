const express = require('express'); 
const apiRouter = express.Router();
const { check, validationResult } = require('express-validator');
//const gravatar = require('gravatar');
const auth = require('../../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// Load User model
const User = require('../../../models/v1/User'); 

// @route   GET api/v1/users/add
// @desc    Show register user FORM view - (Admin add client)
// @access  Public
apiRouter.get('/add', (req, res) => {
  res.render('user/add', { 
    title: 'Add new User',
    firstname: '',
    lastname: '',
    contactnumber: '',
    email: '',
    avatar: ''
  });
});

// @route   POST api/v1/users/register 
// @desc    Register user
// @access  Public 
apiRouter.post('/register', 
  [
    check('firstname', 'Your first name is required please')
      .not()
      .isEmpty(),
    check('lastname', 'Your last name is required please')
      .not()
      .isEmpty(),
    check('contactnumber', 'Your contact number is required')
      .isNumeric(),
    check('password', 'Enter a password with minimum 4 or more characters please')
      .isLength({ min: 4 })
  ],  
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, contactnumber, email, password, password2 } = req.body;

  try {
  // Check if user does exist
  let user = await User.findOne({contactnumber});

  if(user) {
    return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
  }
    /*
    // Get users gravatar/pix if available 
    const avatar = gravatar.url(email, {
      s: '200', // Size default 
      r: 'pg', // Rating
      d: 'mm' // Default (hollow image)
    })
    */

    // Create user instance 
    user = new User({
      firstname,
      lastname,
      contactnumber,
      email,
      password
      //avatar 
    });

    // Encrypt password 
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    // Save user 
    await user.save();

      const payload = {
        user: {
          id: user.id // Although mongoDB uses _id as ObjectId, 
                      // mongoose allows us use just id
        }
      }
    
      jwt.sign(
        payload, 
        config.get('jwtSecret'),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
          //res.json(user);
        }); // Note: jwtSecret above is in config file' and 360000
            // used for expiration (in development), use 3600 in production - now changed!

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
  
});



// @route   POST api/v1/users/update 
// @desc    Edit or update user data
// @access  Private 
apiRouter.get('/update', auth, async (req, res) => {
  const { 
    firstname,
    lastname,
    contactnumber, 
    email,
    avatar
  } = req.body;

  const userFields = {}; 
    
  if(firstname) userFields.firstname = firstname;
  if(lastname) userFields.lastname = lastname;
  if(contactnumber) userFields.contactnumber = contactnumber;
  if(email) userFields.email = email;
  if(avatar) userFields.avatar = avatar;

  try {
    let user = await 
      User
        .findOne({ user: req.user.id })
        
      if (!user) {
        return res.status(400).json({msg: 'There is no user data!'});
      } else if (user) {
        // Update user data - where it already exists
        //user = await User.update(
        user = await User.findOneAndUpdate(
          {user: req.user.id}, 
          { $set: userFields },
          { new: true }
        );
      }

      // Save user 
      await user.save();
  
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
  
});


        // @route   POST api/v1/users/supa-add-user  
        // @desc    Add a user without auth - (Admin add user) 
        // @access  Public
        apiRouter.post('/supa-add-user', 
          [
            check('firstname', 'Your first name is required please')
              .not()
              .isEmpty(),
            check('lastname', 'Your last name is required please')
              .not()
              .isEmpty(),
            check('contactnumber', 'Your contact number is required')
              .isNumeric(),
            check('password', 'Enter a password with minimum 4 or more characters please')
              .isLength({ min: 4 })
          ],  
          async (req, res) => {
          const errors = validationResult(req);
          if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }

          const 
            { 
              firstname, 
              lastname, 
              contactnumber, 
              email, 
              password, 
              //password2,
            } = req.body;

          try {
          // Search if user does already exist 
          let user = await User.findOne({contactnumber});

          if(user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
          }
            /*
            // Get users gravatar/pix if available
            const avatar = gravatar.url(email, {
              s: '200', // Size default 
              r: 'pg', // Rating
              d: 'mm' // Default (hollow image or placeholder)
            })
            */

            // Create user instance
            user = new User({
              firstname,
              lastname,
              contactnumber,
              email,
              password
              //avatar
            });

            // Save user 
            await user.save();

            // Dummy user saved 
            res.send('Dummy user added');

            // Create ownbio instance
            let ownbio = await new Ownbio({ contactnumber })

            // Save ownbio
            await ownbio.save();

            // Log in user immediately after sign in, 
            // by returning jsonwebtoken
            const payload = {
              user: {
                id: user.id // Although mongoDB uses _id as ObjectId, 
                            // mongoose allows us use just id
              }
            }

            jwt.sign(
              payload, 
              config.get('jwtSecret'),
              { expiresIn: '3h' },
              (err, token) => {
                if (err) throw err;
                res.json({ token });
              }); // Note: jwtSecret above is in config file' and '3h' used
                  // for expiration (in development), use 3600 in production 
          
        } catch(err) {
          console.error(err.message);
          res.status(500).send('Server error, something went wrong!');
        }

        });



module.exports = apiRouter;