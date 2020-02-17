const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PetSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId, 
		ref: 'user'
  },
  ownbio: {
		type: Schema.Types.ObjectId, 
		ref: 'ownbio'
	},
  petbio: [
    {
      petname: {
        //type: [String], - array removed; a petbio array is needed for each pet
        type: String,
        //required: true 
      },
      pettype: {
        // type: [String], - array removed; a petbio array is needed for each pet
        type: String,
        //required: true
      },
      age: {
        type: String,
        //required: true
      },
      petbreed: {
        // type: [String] - array removed; a petbio array is needed for each pet 
        type: String
      },
      // Array type, make it easier to process CSV's
      specialneeds: {
        type: [String],
        required: true 
      },
      isBoarder: {
        type: Boolean,
        default: true
      },
      // Could serve as unique identifier for each pet registered to owner
      // firsteverarrivaldate: {
      //   type: Date
      // },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  petavatar: {
			type: String // this may change to buffer 
		},
  status: {
    type: String,
    default: 'boarder' 
  },
  // Could serve as unique identifier for each pet registered to owner 
  firsteverarrivaldate: {
    type: Date
  },
	// Owners fullname (first+last) concantenated - for ease of reference
  // concantenate not done yet 
	fullname: {
		type: String
	},
	datecalc: [
		{
			fromarrivaldate: {
				type: Date,
				default: Date.now
			},
			expectedexitdate: {
				type: Date
			},
			toactualexitdate: {
				type: Date
      },
      from: {
        type: String
      },
      to: {
        type: String
      }
    }
	],
	createddate: {
		type: Date,
		default: Date.now
	}
}); 

module.exports = Pet = mongoose.model('pet', PetSchema); 
