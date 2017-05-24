import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  author: {
    ref: 'user',
    type: mongoose.Schema.Types.ObjectId,
  }
});

export default schema