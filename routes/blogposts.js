var express = require('express')
var ObjectId = require('mongoose').Types.ObjectId

var Blogpost = require('../models/blogpost')
var isRegistered = require('../middleware/authorization').isRegistered
var isAdmin = require('../middleware/authorization').isAdmin

var blogpostRoutes = express.Router()

// GetAll
blogpostRoutes.get('/', isRegistered, (req, res) => {
  Blogpost.find({})
    .sort('-publishedAt')
    .then(blogposts => {
      res.json({
        success: true,
        data: {
          blogposts
        }
      })
    })
})

// Get
blogpostRoutes.get('/:blogpostId', isRegistered, (req, res) => {
  Blogpost.findOne({_id: ObjectId(req.params.blogpostId)})
    .then(blogpost => {
      if (blogpost) {
        res.json({
          success: true,
          data: {
            blogpost
          }
        })
      } else {
        res.status(404).json({
          success: false,
          data: {}
        })
      }
    })
})

// Put
blogpostRoutes.put('/:blogpostId', isRegistered, isAdmin, (req, res) => {
  Blogpost.findOne({_id: ObjectId(req.params.blogpostId)})
    .then(blogpost => {
      if (blogpost) {
        if (!blogpost.isPublished && req.body.blogpost.isPublished) {
          req.body.blogpost.publishedAt = Date.now()
          req.body.blogpost.publishedBy = req.user.name
        }

        Object.assign(blogpost, req.body.blogpost, {
          lastModifiedBy: req.user.name,
          lastModifiedAt: Date.now()
        })

        blogpost.save((err, blogpost) => {
          if (err) {
            res.status(400).json({
              success: false,
              data: err
            })
          } else {
            res.json({
              success: true,
              data: {
                blogpost
              }
            })
          }
        })
      } else {
        res.status(404).json({
          success: false,
          data: {}
        })
      }
    })
})

// Create
blogpostRoutes.post('/', isRegistered, isAdmin, (req, res) => {
  var blogpost = new Blogpost(Object.assign({}, req.body.blogpost, {
    lastModifiedBy: req.user.name,
    lastModifiedAt: Date.now(),
    createdAt: Date.now()
  }))

  if (req.body.blogpost && req.body.blogpost.isPublished) {
    blogpost.publishedAt = Date.now()
    blogpost.publishedBy = req.user.name
  }

  blogpost.save((err, blogpost) => {
    if (err) {
      res.status(400).json({
        success: false,
        data: err
      })
    } else {
      res.json({
        success: true,
        data: {
          blogpost
        }
      })
    }
  })
})

// Delete
blogpostRoutes.delete('/:blogpostId', isRegistered, isAdmin, (req, res) => {
  Blogpost.findOne({_id: ObjectId(req.params.blogpostId)})
    .then(blogpost => {
      if (blogpost) {
        blogpost.remove()

        res.json({
          success: true,
          data: {}
        })
      } else {
        res.status(404).json({
          success: false,
          data: {}
        })
      }
    })
})

// Create comment
blogpostRoutes.post('/:blogpostId/comments/', isRegistered, (req, res) => {
  Blogpost.findOne({_id: ObjectId(req.params.blogpostId)})
    .then(blogpost => {
      if (blogpost) {
        var comment = blogpost.comments.create(Object.assign({}, req.body.comment, {
          lastModifiedBy: req.user.name,
          lastModifiedAt: Date.now(),
          createdAt: Date.now()
        }))

        var nComments = blogpost.comments.length

        blogpost.comments.push(comment)

        blogpost.save((err, blogpost) => {
          if (err) {
            res.status(400).json({
              success: false,
              data: err
            })
          } else {
            res.json({
              success: true,
              data: {
                comment: blogpost.comments[nComments]
              }
            })
          }
        })
      } else {
        res.status(404).json({
          success: false,
          data: {}
        })
      }
    })
})

// Create reply
blogpostRoutes.post('/:blogpostId/comments/:commentId/replies/', isRegistered, (req, res) => {
  Blogpost.findOne({_id: ObjectId(req.params.blogpostId)})
    .then(blogpost => {
      if (blogpost) {
        var comment = blogpost.comments.id(ObjectId(req.params.commentId))

        if (comment) {
          const reply = comment.replies.create(Object.assign({}, req.body.reply, {
            lastModifiedBy: req.user.name,
            lastModifiedAt: Date.now(),
            createdAt: Date.now()
          }))

          var nReplies = comment.replies.length

          comment.replies.push(reply)

          blogpost.save((err, blogpost) => {
            if (err) {
              res.status(400).json({
                success: false,
                data: err
              })
            } else {
              res.json({
                success: true,
                data: {
                  reply: blogpost.comments.filter(c => c._id === comment._id)[0].replies[nReplies]
                }
              })
            }
          })
        } else {
          res.status(404).json({
            success: false,
            data: {}
          })
        }
      } else {
        res.status(404).json({
          success: false,
          data: {}
        })
      }
    })
})

module.exports = blogpostRoutes