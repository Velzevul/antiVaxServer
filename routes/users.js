var express = require('express')
var bcrypt = require('bcrypt')

var User = require('../models/user')
var isRegistered = require('../middleware/authorization').isRegistered
var isAdmin = require('../middleware/authorization').isAdmin

var userRoutes = express.Router()
var saltRounds = 10

// GetAll
userRoutes.get('/', isRegistered, isAdmin, (req, res) => {
  User.find({})
    .then(users => {
      res.json({
        success: true,
        data: {
          users
        },
        message: null
      })
    })
})

// Get
userRoutes.get('/:userId', isRegistered, isAdmin, (req, res) => {
  User.findOne({id: req.params.userId})
    .then(user => {
      if (user) {
        res.json({
          success: true,
          data: {
            user
          },
          message: null
        })
      } else {
        res.status(404).json({
          success: false,
          data: {},
          message: 'requested document not found'
        })
      }
    })
})

// Put
userRoutes.put('/:userId', isRegistered, isAdmin, (req, res) => {
  User.findOne({id: req.params.userId})
    .then(user => {
      if (user) {
        for (let prop in req.body.user) {
          user[prop] = req.body.user[prop]
        }

        user.save((err, section) => {
          if (err) {
            res.status(400).json({
              success: false,
              data: {},
              message: err
            })
          } else {
            res.json({
              success: true,
              data: {
                user
              },
              message: 'document was successfully updated'
            })
          }
        })
      } else {
        res.status(404).json({
          success: false,
          data: {},
          message: 'requested document not found'
        })
      }
    })
})

// Create
userRoutes.post('/', isRegistered, isAdmin, (req, res) => {
  var user = new User(Object.assign({}, req.body.user, {
    password: bcrypt.hashSync(req.body.user.password, saltRounds)
  }))

  user.save()
    .then(user => {
      res.json({
        success: true,
        data: {
          user
        },
        message: 'document was successfully created'
      })
    })
    .catch(err => {
      res.status(400).json({
        success: false,
        data: {},
        message: err
      })
    })
})

// Delete
userRoutes.delete('/', isRegistered, isAdmin, (req, res) => {
  User.findOne({id: req.body.id})
    .then(user => {
      if (user) {
        user.remove()

        res.status(200).json({
          success: true,
          data: {},
          message: 'document was successfully deleted'
        })
      } else {
        res.status(404).json({
          success: false,
          data: {},
          message: 'requested document not found'
        })
      }
    })
})

module.exports = userRoutes
