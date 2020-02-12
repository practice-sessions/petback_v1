const express = require('express');
const apiRouter = express.Router(); 

const auth = require('../../../middleware/auth'); 
const { check, validationResult } = require('express-validator');

const Pet = require('../../../models/v10/Pet');
const OwnBio = require('../../../models/v10/OwnBio');
const User = require('../../../models/v1/User');


// @route   GET api/v10/pet/get-pet-doc 
// @desc    Get current owner's pet data - not sure its needed
// @access  Private 
apiRouter.get('/get-pet-doc', auth, async (req, res) => {

  try {
    let pet = await Pet.findOne({ user: req.user.id }); 

    if (!pet) {
      return res.status(400)
          .json({ msg: 'No pet for this owner!' }); 
      }
    
    else if (pet) {
      await Pet.find({});
        //.populate('pet', ['status', 'petbio']); 

        res.json(pet);
    }
    
    // Redirect to pet registration page here (no pet)
          
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});


// @route   POST api/v10/pets/add-a-pet // POST request used, rather than a  
// @desc    Add pet data with petbio
// @access  Private
apiRouter.post('/add-a-pet', 
[
  auth, 
  [
    check('age', 'How old is your pet please?')
      .not()
      .isEmpty(),
    check('petname', 'Please enter pet name')
      .not()
      .isEmpty(),
    check('pettype', 'Please enter pet type')
      .not()
      .isEmpty(),
    check('petbreed', 'Please enter pet breed')
      .not()
      .isEmpty(),
    check('specialneeds', 
      'Briefly provide any special needs info for your pet, if any please')
      .not()
      .isEmpty()
  ]
], 
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    age,
    petname,
    pettype,
    petbreed,
    specialneeds,
    firsteverarrivaldate,
    isBoarder
  } = req.body;

  const ownbio = req.body.id;

  const petBioFields = {
    age,
    petname,
    pettype,
    petbreed,
    specialneeds,
    firsteverarrivaldate,
    isBoarder,
    ownbio
  };

  petBioFields.user = req.user.id;

  if(specialneeds) {
    petBioFields.specialneeds = specialneeds
      .split(',')
      .map(specialneed => specialneed.trim());
  };

  try {

    let ownbio = await OwnBio.findOne({ user: req.user.id });

    if (!ownbio) {
      return res.status(400)
        .json({ msg: 'No bio for this owner!' }); 
    }

    let pet = await Pet.findOne({user: req.user.id}); 

    if (!pet) {

      // Create pet 
      pet = new Pet(petBioFields);

      // Push petbio array so its nested inside pet
      await pet.petbio.push(petBioFields);

      await pet.save();
    }

    else if (pet) {
      // Push petbio array so its nested inside pet 
      // Use unshift so newly created pet goes to top of array
      await pet.petbio.unshift(petBioFields);

      await pet.save();
    }

      // Update owner bio - where it already exists  
      //ownbio = await OwnBio.updateOne(
      ownbio = await OwnBio.findOneAndUpdate(
        { user: req.user.id }, 
        { $set: petBioFields, pet },
        { new: true }
      );

        res.json(ownbio);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

});


// @route   GET api/v10/pet/get-petbio  
// @desc    Get current owner's pet data - not sure its needed 
// @access  Private 
apiRouter.get('/get-petbio', auth, async (req, res) => {

  try {
    let pet = await Pet.findOne({ user: req.user.id });
    
    if (!pet) {
      return res.status(400)
          .json({ msg: 'No pet for this owner!' }); 
      }

      else if (pet) {
       await pet.populate({
         path: 'petbio'
       });
       
       res.json(pet.petbio);

      }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});



// @route   DELETE api/v10/pets/delete 
// @desc    Delete pet [(and ToDo) delete pets data ] 
// @access  Private 
apiRouter.delete('/delete', auth, async (req, res) => {
  try {
   
    await Pet.findOneAndRemove({ user: req.user.id }); 

    return res.status(200).send('Pet deleted!'); 
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});


// @route   GET api/v10/pets/all
// @desc    Get all pets data 
// @access  Private
apiRouter.get('/all', auth, async (req, res) => {
  try {
    const pets = await Pet.find().sort({ date: -1 });

    res.json(pets);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});


module.exports = apiRouter; 
