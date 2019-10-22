/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require("mongodb").ObjectID

let LOCAL_DB = false

const MONGO_URI = LOCAL_DB ? 
      `mongodb://${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_NAME}` : 
      "mongodb+srv://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASS +
      "@cluster0-vakli.mongodb.net/test?retryWrites=true&w=majority"

// Database variables
var db         // database connection variable
var boards     // database collection variable

module.exports = function (app) {
    
  // Connect database
  MongoClient.connect(MONGO_URI, function(err, database) {
    if (err) console.log("Database couldn't connect")
    else {
      console.log("Database connected")
      db = database.db(process.env.DB_NAME)
      boards = db.collection('boards')
    }
  })

  
  app.route('/api/threads/')
    .post(function(req, res) {
      res.send('must provide a board')
    })
    .get(function(req, res) {
      res.send('must provide a board')
    })
    .put(function(req, res) {
      res.send('must provide a board')
    })
    .delete(function(req, res) {
      res.send('must provide a board')
    })
    
  
  app.route('/api/threads/:board')
    .post(function(req, res) {
      let board = req.params.board
      if(!board) return res.send('must provide a board')
    
      let created_on = new Date()
      let thread = {
        board,
        text: req.body.text,
        created_on,
        bumped_on: created_on,
        reported: false,
        delete_password: req.body.delete_password,
        replies: []
      }      
      
      boards.insertOne(thread, (err, doc) => {
        if(err || !doc) res.send('Failed to create the thread')
        else            res.send(doc.ops[0])//res.redirect('/b/' + board)  //res.send(doc.ops[0])
      })
    })
    
    .get(function(req, res){
      let board = req.params.board
      if(!board) return res.send('must provide a board')
    
      boards.find({ board: board }, { reported: 0, delete_password: 0 , replies: { $slice: -3 } })
        .sort({ bumped_date: -1} )
        .limit(10)
        .toArray(function(err, threads) {
          if(err) res.send('error: ' + err)
          else if(!threads)  res.send('query without results')
          else    res.json(threads) //res.redirect('b/' + board)  //res.json(threads)
      })      
    })
  
    .put(function(req, res) {
      let board = req.params.board
      if(!board) return res.send('must provide a board')
      let thread_id = req.body.thread_id
      if(!thread_id) return res.send('must provide a thread id')
    
      boards.findOneAndUpdate(
        { _id: new ObjectId(thread_id), board: board },
        { $set: { reported: true } },
        function(err, doc) {
          if(err)              res.send('error')       
          else if(!doc.value)  res.send('query without results')
          else                 res.send('success')          
        }
      )    
    })
    
    .delete(function(req, res) {
      let board = req.params.board
      if(!board) return res.send('must provide a board')
      let thread_id = req.body.thread_id
      if(!thread_id) return res.send('must provide a thread id')
      let delete_password = req.body.delete_password
      if(!delete_password) return res.send('must provide a delete password')
      
      boards.findOne(
        { _id: new ObjectId(thread_id) }, 
        function(err, doc) {
          if(err) 
            res.send('error')
          else if(doc.board != board)
            res.send('incorrect board')  
          else if(doc.delete_password != delete_password)
            res.send('incorrect password')
          else
            boards.deleteOne({ _id: new ObjectId(doc._id) }, function(err, _) {
              if(err)   res.send('error')
              else      res.send('success')
            })          
        }
      )
    })
          
  
  app.route('/api/replies/:board')
    .post(function(req, res) {
      let board = req.params.board
      if(!board) return res.send('must provide a board')
      let thread_id = req.body.thread_id
      if(!thread_id) return res.send('must provide a thread id')
      let reply_created_on = new Date()
      let reply = {
        _id: new ObjectId(),
        text: req.body.text,
        created_on: reply_created_on,
        delete_password: req.body.delete_password,
        reported: false
      }      
      boards.findOneAndUpdate(
        { _id: new ObjectId(thread_id), board: board },
        { $push: { replies: reply }, 
          $set: { bumped_on: reply_created_on } },
        { returnOriginal: false },
        function(err, doc) {
          if(err)         res.send('error: ' + err)
          else if(!doc)   res.send('query without results')
          else            res.json(doc.value)
          //res.redirect('/b/' + board + '?thread_id=' + thread_id)
        }
      )
    })
  
    .get(function(req, res) {
      let board = req.params.board
      if(!board) return res.send('must provide a board')
      let thread_id = req.query.thread_id
      if(!thread_id) return res.send('must provide a thread id')
      boards.findOne(
        { _id: new ObjectId(thread_id), board: board},
        { reported: 0, delete_password: 0 },
        function(err, doc) {
          if(err)        res.send('error')
          else if(!doc)  res.send('query without results')
          else           res.json(doc)
      })
    })
  
    .put(function(req, res) {
      let board = req.params.board
      if(!board) return res.send('must provide a board')
      let thread_id = req.body.thread_id
      if(!thread_id) return res.send('must provide a thread id')
      let reply_id = req.body.reply_id
      if(!reply_id) return res.send('must provide a reply id')
      boards.findOneAndUpdate(
        { _id: new ObjectId(thread_id), 
          board: board,
          "replies._id": new ObjectId(reply_id) }, 
        { $set: { "replies.$.reported": true } },
        { returnOriginal: false },
        function(err, doc) {          
          if(err)              res.send('error')       
          else if(!doc.value)  res.send('query without results')
          else                 res.send('success')                
      })
        
    })
  
    .delete(function(req, res) {
      let board = req.params.board
      if(!board) return res.send('must provide a board')
      let thread_id = req.body.thread_id
      if(!thread_id) return res.send('must provide a thread id')
      let reply_id = req.body.reply_id
      if(!reply_id) return res.send('must provide a reply id')
      let delete_password = req.body.delete_password
      if(!delete_password) return res.send('must provide a delete password')
    
      boards.findOneAndUpdate(
        { _id: new ObjectId(thread_id), 
          board: board,
         "replies._id": new ObjectId(reply_id),
         "replies.delete_password": delete_password 
        },
        { $pull: { replies: { _id: new ObjectId(reply_id) } } },
        { returnOriginal: false },
        function(err, doc) {
          //console.log(doc)
          //console.log(doc.value)
          //console.log(doc.value)
          if(err)              res.send('error: ' + err)       
          else if(!doc.value)  res.send('query without results')
          else                 res.send('success')      
      })
    
    })

};
