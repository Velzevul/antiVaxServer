var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
mongoose.Promise = require('bluebird')
var Schema = mongoose.Schema

var replySchema = new Schema({
  content: {
    type: String,
    required: [true, 'content cannot be empty']
  },
  createdAt: Date,
  lastModifiedBy: String,
  lastModifiedAt: Date
})

var commentSchema = new Schema({
  content: {
    type: String,
    required: [true, 'content cannot be empty']
  },
  createdAt: Date,
  lastModifiedBy: String,
  lastModifiedAt: Date,
  replies: {
    type: [replySchema],
    default: []
  }
})

var articleSchema = new Schema({
  url: {
    type: String,
    required: [true, 'url cannot be empty'],
    index: true,
    unique: true
    // TODO: add no-spaces validation
  },
  type: {
    id: {
      type: String,
      required: [true, 'type id cannot be empty']
    },
    label: {
      type: String,
      required: [true, 'type label cannot be empty']
    }
  },
  title: {
    type: String,
    required: [true, 'title cannot be empty'],
    unique: true
  },
  snippet: {
    type: String,
    default: ''
  },
  content: String,
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: Date,
  lastModifiedBy: String,
  lastModifiedAt: Date,
  attachment: String,
  comments: {
    type: [commentSchema],
    default: []
  }
})

articleSchema.plugin(uniqueValidator, { message: '{VALUE} is already taken' })
module.exports = mongoose.model('Article', articleSchema)
