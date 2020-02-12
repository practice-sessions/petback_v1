const express = require('express');

/* Include {mergeParams; true} in file where the nested params reside. 
	mergeParams tells apiRouter to merge parameters that are created on 
	this set of routes with the ones from its parents 
*/
const apiRouter = express.Router({ mergeParams: true });

const auth = require('../../../middleware/auth'); 
const { check, validationResult } = require('express-validator');

const OwnBio = require('../../../models/v10/OwnBio');
const User = require('../../../models/v1/User');


// @route   POST api/v10/ownbio 
// @desc    Create owner bio data (instance)
// @access  Private
apiRouter.post('/link-ownbio-to-user', 
[ 
  auth, 
  [
    check('vetname', 'Your vets name and number is required')
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
    vetname
  } = req.body;

  // Build owner bio object 
  const ownerBioFields = {};

  ownerBioFields.user = req.user.id;

  if(vetname) ownerBioFields.vetname = vetname;
  
  try {
    let ownbio = await OwnBio.findOne({ user: req.user.id });

    if (ownbio) {
      
      // Update owner bio - where it already exists 
      ownbio = await OwnBio.findOneAndUpdate(
        { user: req.user.id }, 
        { $set: ownerBioFields },
        { new: true }
      );

      return res.json(ownbio);
    }

    // Create owner bio fields - where it does not already exist
    ownbio = new OwnBio(ownerBioFields);

    // Push pets array onto the owner bio using unshift (not PUSH) so it goes
    // into the beginning rather than at the end so we get the most recent first 
    //ownbio.pets.unshift(newPet);

    await ownbio.save();

    res.json(ownbio);
  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

}); 



// @route   GET api/v10/ownbio/named
// @desc    Get current owner's bio data 
// @access  Private
apiRouter.get('/named', auth, async (req, res) => {

  try {
    const ownbio = await 
      OwnBio
        .findOne({ user: req.user.id }).populate(
          // Pull required data from user profile
          'user', ['firstname', 'lastname', 'contactnumber', 'email']);
          
        res.json(ownbio);         
                    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});




              // ============

              

                    // @route   POST api/v10/ownbio 
                    // @desc    Create owner bio data (instance)
                    // @access  Private
                    apiRouter.post('/add-ownbio-to-user', 
                    [ 
                      auth, 
                      [
                        // check('contactnumber', 'Confirm contact number please')
                        //   .isNumeric(), 
                        check('age', 'How old is your pet?')
                          .not()
                          .isEmpty(),
                        check('vetname', 'Your vets name and number is required')
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
                        //contactnumber,
                        age,
                        vetname, 
                        specialneeds
                      } = req.body;

                      const newPet = new Pet({ 
                        age 
                      });

                      // Build owner bio object
                      const ownerBioFields = {};

                      ownerBioFields.user = req.user.id;

                      //if(contactnumber) ownerBioFields.contactnumber = contactnumber;
                      if(age) ownerBioFields.age = age;
                      if(vetname) ownerBioFields.vetname = vetname;
                      if(specialneeds) {
                        ownerBioFields.specialneeds = specialneeds
                          .split(',')
                          .map(specialneed => specialneed.trim());
                      }

                      try {
                        let ownbio = await OwnBio.findOne({ user: req.user.id });

                        if (ownbio) {
                          // Save new pet
                          const pet = await newPet.save();

                          // Update owner bio - where it already exists 
                          ownbio = await OwnBio.findOneAndUpdate(
                            { user: req.user.id }, 
                            { $set: ownerBioFields, pet },
                            { new: true }
                          );

                          return res.json(ownbio);
                        }

                        // Create owner bio fields - where it does not already exist
                        ownbio = new OwnBio(ownerBioFields);

                        // Push pet array onto the owner bio using unshift (not PUSH) so it goes
                        // into the beginning rather than at the end so we get the most recent first 
                        ownbio.pet.unshift(newPet);

                        await ownbio.save();

                        res.json(ownbio);
                      
                    } catch (err) {
                      console.error(err.message);
                      res.status(500).send('Server error, something went wrong!');
                    }

                    });

            // ==========


// @route   PUT api/v10/ownbio
// @desc    Update owner bio data
// @access  Private 
apiRouter.put('/update', auth, async (req, res) => {
  const { 
    vetname, 
    specialneeds
  } = req.body;

  // Build owner bio object
  const ownerBioFields = {};

  //if(contactnumber) ownerBioFields.contactnumber = contactnumber;
  if(vetname) ownerBioFields.vetname = vetname;
  if(specialneeds) ownerBioFields.specialneeds = specialneeds;

  try {
    let ownbio = await OwnBio.findOne({user: req.user.id});

    if (!ownbio) {
      return res.status(400).json({msg: 'There is no owner bio data!'});
    
    } else if (ownbio) {
      // Update owner bio - where it already exists
      ownbio = await OwnBio.findOneAndUpdate(
        {user: req.user.id}, 
        { $set: ownerBioFields },
        { new: true }
      );
    }

    await ownbio.save();

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  } 

});






// @route   GET api/v10/ownbio/all 
// @desc    Get all owners' bio data
// @access  Private 
apiRouter.get('/all', auth, async (req, res) => {
  try {
    const ownbios = await OwnBio.find().populate('user', ['firstname', 'lastname', 'contactnumber', 'pets', 'avatar']);
    if (ownbios === 0) {
      return res.status(400).json({msg: 'There is no owner bio data!'});
    }
    res.json(ownbios);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
}); 



// @route   GET api/v10/ownbio/owner-pet
// @desc    Get current owner and pet bio data 
// @access  Private
apiRouter.get('/owner-pet', auth, async (req, res) => {

  try {
    const ownbio = await 
      OwnBio
        .findOne({ user: req.user.id });

        let pet = await Pet.findOne({ user: req.user.id });
    
        if (!pet) {
          return res.status(400)
            .json({ msg: 'No pet for this owner!' }); 
        } 
        else if (pet) {
          await pet.populate(['petbio']);

          res.json(pet.petbio);
      }
  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});




// @route   GET api/v10/ownbio/owners-pet
// @desc    Get current owner bio data incl. pet
// @access  Private 
apiRouter.get('/owners-pet', auth, async (req, res) => {

  try {
    const ownbio = await 
      OwnBio
        .findOne({ user: req.user.id });

        let pet = await Pet.findOne({ user: req.user.id });
    
        if (!pet) {
          return res.status(400)
            .json({ msg: 'No pet for this owner!' }); 
        } 
        else if (pet) {

          await ownbio.populate('pet', ['petbio']);
     
          res.json(pet.petbio);
      }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});




// @route   DELETE api/v10/ownbio/delete 
// @desc    Delete owner bio data [(and ToDo) delete pets data ] 
// @access  Private 
apiRouter.delete('/delete', auth, async (req, res) => {
  try {
    await OwnBio.findOneAndRemove({ user: req.user.id });
    return res.status(200).send('Owners bio successfully deleted!');
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});


                    // @route   DELETE api/v10/ownbio/delete-field-obj
                    // @desc    Delete field or object from record?  
                    // @access  Private 
                    apiRouter.delete('/delete-field-obj', auth, async (req, res) => {
                      try {
                        let ownbio = await OwnBio.findOne({ user: req.user.id });

                        await updateOne({'field-obj-to-delete': {$exists: true}}, {$unset: {'field-obj-to-delete': 1}}, false, true);
                        
                        return res.status(200).send('Object or field successfully deleted!');
                        
                      } catch (err) {
                        console.error(err.message);
                        res.status(500).send('Server error, something went wrong!');
                      }
                    });






// @route   POST api/v10/ownbio/address-to-bio // POST request used, rather than a  
// PUT although we are updating data in an existing collection - personal preference
// @desc    Add address to owner bio data 
// @access  Private 
apiRouter.post('/address-to-bio', 
[ 
  auth, 
  [
    check('house', 'A house name or street number is required please')
      .not()
      .isEmpty(),
    check('postcode', 'A postcode is required please')
      .not()
      .isEmpty(),
    check('city', 'A town or city name is required please')
      .not()
      .isEmpty()
  ] 
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    house,
    street,
    street2,
    postcode,
    city
  } = req.body; 

  const addy = {
    house,
    street,
    street2,
    postcode,
    city
  }

  try {
    // Fetch owner bio to add address 
    const ownbio = await OwnBio.findOne({ user: req.user.id });

    // What if user has no bio?
    if(!ownbio) {
      return res.status(400)
        .json({ msg: 'No owner bio for this user!' }); 
    }

    // Push address array onto the owner bio using unshift (not PUSH) so it goes
    // into the beginning rather than at the end so we get the most recent first 
    ownbio.address.unshift(addy);

    await ownbio.save();

    res.json(ownbio);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }

});

// @route   DELETE api/v10/ownbio/address/:addy_id
// @desc    Delete address from owner bio 
// @access  Private 
apiRouter.delete('/address/:addy_id', auth, async (req, res) => {
  try {
    const ownbio = await OwnBio.findOne({ user: req.user.id });

    // To get the right address to remove, get remove index 
    const removeIndex = ownbio.address
      .map(item => item.id)
      .indexOf(req.params.addy_id);
    
    ownbio.address.splice(removeIndex, 1);

    await ownbio.save();

    res.json(ownbio);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});

      // @route   POST api/v10/ownbio/addpet-to-ownbio // POST request used, rather than a  
      // PUT although we are updating data in an existing collection - personal preference
      // @desc    Create pet, and add to owner bio data
      // @access  Private 
      apiRouter.post('/addpet-to-ownbio', 
      [ 
        auth, 
        [
          check('age', 'How old is your pet?')
            .not()
            .isEmpty()
        ] 
      ], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const age = req.body.age;

        try {
          const newPet = new Pet({ 
            age,
            ownbio: req.ownbio.id 
          });

          const pet = await newPet.save();

          res.json(pet);

        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error, something went wrong!');
        }

        try {
          // Fetch owner bio to add pet data 
          const ownbio = await OwnBio.findOne({ user: req.user.id });
          //const ownbio = await OwnBio.findOne({ pets: req.pet.id }); 

          // What if user has no bio?
          if(!ownbio) {
            return res.status(400)
              .json({ msg: 'No owner bio for this user!' }); 
          }

          // Push pets array onto the owner bio using unshift (not PUSH) so it goes
          // into the beginning rather than at the end so we get the most recent first 
          //ownbio.pets.unshift(newPet);
          ownbio.pet.unshift(newPet);

          await ownbio.save();

          res.json(ownbio);

        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error, something went wrong!');
        }

      });



// @route   PUT api/v10/ownbio/update-ownbio-deleted-pet 
// @desc    Update owner bio data aftet pet object deleted in previous action
// @access  Private 
apiRouter.put('/update-ownbio-deleted-pet', auth, async (req, res) => {
  
  var { 
    _id,
    user,
    vetname,
    address,
    date,
    __v,
    pet
   } = req.body;

  
  var ownbioItems = [  
    { 
      _id,
      user,
      vetname,
      address,
      date,
      __v,
      pet
   }
  ];

  try {
    let ownbio = await OwnBio.findOne({user: req.user.id});

      ownbioItems.splice(ownbioItems.indexOf('pet'), 1);
    
      await OwnBio.updateOne(
        {user: req.user.id}, 
        { $set: ownbioItems },
        //{ $set: ownbioItemFields },
        { new: true }
      ); 
    //}

    await ownbio.save(); 

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  } 

});   


// @route   DELETE api/v10/ownbio/delete-field-obj
// @desc    Delete pet object from record 
// @access  Private 
apiRouter.delete('/delete-pet-obj', auth, async (req, res) => {
  try {

    // This route is expcted to remove pet object, 
    // which has already been deleted from pet collection
    // via a dedicated pet (record) delete route
    var ownbio = await OwnBio.findOne({user: req.user.id});
    
      ownbio
      .updateOne(req.params.id)
      .splice(ownbio => ownbio.indexOf('pet'), 1);

      await ownbio.save(); 

    return res.status(200).send('Pet object successfully removed!');
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});


// @route   DELETE api/v10/ownbio/delete-pet-pet
// @desc    Delete pet [(and ToDo) delete pets data ] 
// @access  Private 
apiRouter.delete('/delete-pet-pet', auth, async (req, res) => {
  try {

    let pet = await Pet.findOneAndRemove({ user: req.user.id });

    // This worked fine, but has failed to delete pet (from pet context)
    // Is this best remedied from a reducer action?
    var ownbio = await OwnBio
      .updateOne({user: req.user.id})
      .splice(ownbio => (ownbio.indexOf('pet')), 1);

    await ownbio.save();
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error, something went wrong!');
  }
});


module.exports = apiRouter; 
