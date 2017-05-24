import mongoose, {Schema} from 'mongoose';
import _ from 'lodash'
import userSchema from './model.user.js'
import bookSchema from './model.book.js'

 mongoose.Promise = global.Promise;
const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/app-data');

 function ownerIdPlugin (schema, options) {
  schema.add({ 
    // creat
    ownerId: {
      ref: 'user',
      type: mongoose.Schema.Types.ObjectId,
      lockdown: 1
    } 
  });

  schema.pre('findOneAndUpdate', function(next) {
    // delete this._update.ownerId;
    // delete this._update.createdAt;
    this._update = _.omit(this._update, ['_id', '__v', 'ownerId', 'createdAt'])
    this._update.updatedAt = new Date();
    console.log(this._update)
    next();
  });

  // schema.pre('save', function(next) {
  //   delete this._update.ownerId;
  //   this._update.updatedAt = new Date();
  //   next();
  // });
  
  if (options && options.index) {
    schema.path('ownerId').index(options.index)
  }
}

mongoose.plugin(ownerIdPlugin)
 
connection.model('user', userSchema);
connection.model('book', bookSchema);
 
export default connection;