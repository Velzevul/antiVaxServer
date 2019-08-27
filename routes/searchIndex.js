var express = require('express')
var algoliasearch = require('algoliasearch')
var client = algoliasearch(process.env.ANTIVAX_ALGOLIA_APPID, process.env.ANTIVAX_ALGOLIA_APIKEY)

var SearchIndex = require('../models/searchIndex')
var Article = require('../models/article')
var isRegistered = require('../middleware/authorization').isRegistered
var isAdmin = require('../middleware/authorization').isAdmin

var searchIndexRoutes = express.Router()

searchIndexRoutes.get('/', isRegistered, isAdmin, (req, res) => {
  SearchIndex.findOne()
    .then(searchIndex => {
      if (searchIndex) {
        res.json({
          success: true,
          data: {
            searchIndex
          }
        })
      } else {
        var newSearchIndex = new SearchIndex({
          lastUpdatedBy: req.user.name,
          lastUpdatedOn: Date.now()
        })

        newSearchIndex.save((err, searchIndex) => {
          if (err) {
            res.status(400).json({
              success: false,
              data: err
            })
          } else {
            res.json({
              success: true,
              data: {
                searchIndex
              }
            })
          }
        })
      }
    })
})

searchIndexRoutes.put('/', isRegistered, isAdmin, (req, res) => {
  SearchIndex.findOne()
    .then(searchIndex => {
      if (searchIndex) {
        Article.find({})
          .then(articles => {
            var categoryParentMap = {}
            const categoryParents = articles.filter(a => a.attachment)
            for (let article of categoryParents) {
              categoryParentMap[article.attachment] = article
            }

            var indexData = articles
              .filter(a => a.isPublished)
              .map(a => {
                let parentUrls = [`articles/${a.url}`]

                let currentParent = sections.find(s => s._id.equals(a.parent))
                while (!currentParent.meta) {
                  parentUrls = [currentParent.url, ...parentUrls]
                  currentParent = sections.find(s => s._id.equals(currentParent.parent))
                }

                return {
                  url: `/${parentUrls.join('/')}`,
                  title: a.title,
                  content: a.content
                }
              })


            var index = client.initIndex('pages')
            index.clearIndex((err, content) => {
              if (err) {
                res.status(400).json({
                  success: false,
                  data: err
                })
              }
            })
            index.addObjects(indexData, (err, content) => {
              if (err) {
                res.status(400).json({
                  success: false,
                  data: err
                })
              } else {
                searchIndex.lastUpdatedBy = req.user.name
                searchIndex.lastUpdatedOn = Date.now()

                searchIndex.save((err, searchIndex) => {
                  if (err) {
                    res.status(400).json({
                      success: false,
                      data: err
                    })
                  } else {
                    res.json({
                      success: true,
                      data: {
                        searchIndex
                      }
                    })
                  }
                })
              }
            })
          })
      } else {
        res.status(404).json({
          success: false,
          data: {}
        })
      }
    })
})

module.exports = searchIndexRoutes
