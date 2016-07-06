var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var Schema = mongoose.Schema

var pageSchema = new Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: String,
  items: [this]
})

var sectionSchema = new Schema({
  id: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  lastModifiedBy: String,
  lastModifiedAt: Date,
  pages: [pageSchema]
})

module.exports = mongoose.model('Section', sectionSchema)
