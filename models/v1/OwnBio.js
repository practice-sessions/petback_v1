const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema - "OwnBio" == pet owner bio 
const OwnBioSchema = new Schema({
	user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  pet: {
    type: Schema.Types.ObjectId,
    ref: 'pet'
  },
	address: [
		{
			house: {
				type: String,
				required: true 
      },
      street: {
				type: String,
				//required: 'A street name is required please'
      }, 
      street2: {
        type: String
      },
      postcode: {
				type: String,
				required: true 
      },
      city: {
				type: String,
				required: true 
      },
      date: {
        type: Date,
        default: Date.now
      }
		}
	],
	vetname: {
		type: String,
		required: true
  },
  date: {
		type: Date,
		default: Date.now
	}
});

/*

// Virtual for fullname - not yet in use
OwnBioSchema.virtual('fullname').get(function () {
  return this.firstname + ', ' + this.lastname; 
});
*/ 
 
module.exports = OwnBio = mongoose.model('ownbio', OwnBioSchema); 
