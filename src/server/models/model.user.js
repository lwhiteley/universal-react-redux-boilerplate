import mongoose, {Schema} from 'mongoose';
import _ from 'lodash';
const bcrypt = require('bcrypt');

const schema = new Schema({
  name: {
    type: String,
    required: true,
    default: 'mike',
    index: true,
    unique: true
  },
  passwordHash: { 
    type: String, 
    // required: true 
  },
  age: Number,
  email: String,
  address: String,
  male: Boolean,
  bornAt: {
    type: Date,
    default: new Date()
  },
  likes: [String]
});

schema.virtual('password')
  .get(function() {
    return this._password;
  })
  .set(function(value) {
    this._password = value;
    var salt = bcrypt.genSaltSync(12);
    this.passwordHash = bcrypt.hashSync(value, salt);
  });

schema.virtual('passwordConfirmation')
  .get(function() {
    return this._passwordConfirmation;
  })
  .set(function(value) {
    this._passwordConfirmation = value;
  });

schema.path('passwordHash').validate(function(v) {
  if (this._password || this._passwordConfirmation) {
    if (this._password.length < 6) {
      this.invalidate('password', 'must be at least 6 characters.');
    }
    if (this._password !== this._passwordConfirmation) {
      this.invalidate('passwordConfirmation', 'must match confirmation.');
    }
  }

  if (this.isNew && !this._password) {
    this.invalidate('password', 'required');
  }
}, null);

schema.methods.toJSON = function() {
  var obj = this.toObject()
  delete obj.passwordHash
  return obj
}

schema.methods.comparePassword = function(candidatePassword, cb) {
  // console.log(this, candidatePassword)
   return bcrypt.compare(candidatePassword, this.passwordHash)
    .then((isMatch) => {
      return isMatch
    })
    .catch(err => err);
};

export default schema