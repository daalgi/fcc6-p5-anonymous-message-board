/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // Variables to be used for multiple tests
  var test_thread_id, test_thread_id2    
  var test_board = 'Test board'
  var test_board2 = 'Test board 2'
  var test_board_arr = []
  var test_text = 'test text'
  var test_delete_password = '123'
  
  var test_reply_id = []
  var reply_num = 0
  var test_reply_text = 'reply text'  
  
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('Post a thread', function(done) {
        
        chai.request(server)
          .post('/api/threads/' + test_board)
          .send({ 
            text: test_text,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            test_thread_id = res.body._id
            assert.property(res.body, 'board')
            assert.equal(res.body.board, test_board)
            assert.property(res.body, 'text')
            assert.equal(res.body.text, test_text)
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.equal(res.body.created_on, res.body.bumped_on)
            assert.property(res.body, 'reported')
            assert.isFalse(res.body.reported)
            assert.property(res.body, 'delete_password')
            assert.equal(res.body.delete_password, test_delete_password)
            assert.property(res.body, 'replies')
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, 0)
            done()
          })  
      })
      
      test('Post a thread without the board name', function() {
        
        chai.request(server)
          .post('/api/threads/')
          .send({
            text: test_text,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'must provide a board')
          })
      })
      
    });
    
    suite('GET', function() {
      
      test('Get the threads of a board', function(done) {
        
        chai.request(server)
          .get('/api/threads/' + test_board)
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            //assert.equal(res.body.length, 1)    // The test thread must be deleted each time to pass this test
            assert.property(res.body[0], '_id')
            assert.equal(res.body[0]._id, test_thread_id)
            assert.property(res.body[0], 'board')
            assert.equal(res.body[0].board, test_board)
            assert.property(res.body[0], 'text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'bumped_on')
            assert.equal(res.body[0].created_on, res.body[0].bumped_on)
            assert.equal(res.body[0].text, test_text)
            assert.equal(res.body[0].reported, undefined)
            assert.equal(res.body[0].delete_password, undefined)
            done()
          })        
      })
      
      test('Get the threads of a board without the board name', function(done) {
        
        chai.request(server)
          .get('/api/threads/')
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'must provide a board')
            done()
          })
      })
      
    });
    
    suite('DELETE', function() {
      
      test('Delete a thread without the board name', function(done) {
        
        chai.request(server)
          .delete('/api/threads/')
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'must provide a board')
            done()
          })
      })
      
      test('Delete a thread with incorrect password', function(done) {
        
        chai.request(server)
          .delete('/api/threads/' + test_board)
          .send({
            thread_id: test_thread_id,
            delete_password: '123456789'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'incorrect password')
            done()
          })
      })
      
      test('Delete the thread created', function(done) {
        
        chai.request(server)
          .delete('/api/threads/' + test_board)
          .send({
            thread_id: test_thread_id,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
          })
      })
      
    });
    
    suite('PUT', function() {
            
      test('Post a new thread and report it', function(done) {
        
        chai.request(server)
          .post('/api/threads/' + test_board2)
          .send({ text: test_text, delete_password: test_delete_password })  
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            test_thread_id2 = res.body._id
            assert.property(res.body, 'board')
            assert.equal(res.body.board, test_board2)
            assert.property(res.body, 'text')
            assert.equal(res.body.text, test_text)
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.equal(res.body.created_on, res.body.bumped_on)
            assert.property(res.body, 'reported')
            assert.isFalse(res.body.reported)
            assert.property(res.body, 'delete_password')
            assert.equal(res.body.delete_password, test_delete_password)
            assert.property(res.body, 'replies')
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, 0)
            done()
          })       
      })
        
      test('Report a reply with wrong id', function(done) {
        
        chai.request(server)
          .put('/api/threads/' + test_board2)
          .send({
            thread_id: test_thread_id  // incorrect thread_id
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'query without results')
            done()
          })
      })
      
      test('Report the new thread', function(done) {
        
        chai.request(server)
          .put('/api/threads/' + test_board2)
          .send({
            thread_id: test_thread_id2,
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
          })
      })
      
      test('Check the reported thread', function(done) {
        
        chai.request(server)
          .get('/api/threads/' + test_board2)
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'bumped_on')
            assert.equal(res.body[0].created_on, res.body[0].bumped_on)
            done()
          })
      })
      
    })
    
  })
  
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('Post a reply to a thread', function(done) {
        
        chai.request(server)
          .post('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            text: test_reply_text,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            assert.equal(res.body._id, test_thread_id2)
            assert.property(res.body, 'board')
            assert.equal(res.body.board, test_board2)
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.notEqual(res.body.created_on, res.body.bumped_on)
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, reply_num+1)
            assert.property(res.body.replies[reply_num], '_id')
            test_reply_id[reply_num] = res.body.replies[reply_num]._id
            assert.property(res.body.replies[reply_num], 'text')
            assert.equal(res.body.replies[reply_num].text, test_reply_text)
            assert.property(res.body.replies[reply_num], 'created_on')
            assert.equal(res.body.bumped_on, res.body.replies[reply_num].created_on)
            assert.property(res.body.replies[reply_num], 'reported')
            assert.isFalse(res.body.replies[reply_num].reported)
            done()
          })
      })   
      
      test('Post a second reply to the thread', function(done) {
        
        chai.request(server)
          .post('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            text: test_reply_text,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            reply_num++
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            assert.equal(res.body._id, test_thread_id2)
            assert.property(res.body, 'board')
            assert.equal(res.body.board, test_board2)
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.notEqual(res.body.created_on, res.body.bumped_on)
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, reply_num+1)
            assert.property(res.body.replies[reply_num], '_id')
            test_reply_id[reply_num] = res.body.replies[reply_num]._id
            assert.property(res.body.replies[reply_num], 'text')
            assert.equal(res.body.replies[reply_num].text, test_reply_text)
            assert.property(res.body.replies[reply_num], 'created_on')
            assert.equal(res.body.bumped_on, res.body.replies[reply_num].created_on)
            assert.property(res.body.replies[reply_num], 'reported')
            assert.isFalse(res.body.replies[reply_num].reported)
            done()
          })
      })   
    
      test('Post a third reply to the thread', function(done) {
        
        chai.request(server)
          .post('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            text: test_reply_text,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            reply_num++
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            assert.equal(res.body._id, test_thread_id2)
            assert.property(res.body, 'board')
            assert.equal(res.body.board, test_board2)
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.notEqual(res.body.created_on, res.body.bumped_on)
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, reply_num+1)
            assert.property(res.body.replies[reply_num], '_id')
            test_reply_id[reply_num] = res.body.replies[reply_num]._id
            assert.property(res.body.replies[reply_num], 'text')
            assert.equal(res.body.replies[reply_num].text, test_reply_text)
            assert.property(res.body.replies[reply_num], 'created_on')
            assert.equal(res.body.bumped_on, res.body.replies[reply_num].created_on)
            assert.property(res.body.replies[reply_num], 'reported')
            assert.isFalse(res.body.replies[reply_num].reported)
            done()
          })
      })
      
      test('Post a fourth reply to the thread', function(done) {
        
        chai.request(server)
          .post('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            text: test_reply_text,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            reply_num++
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            assert.equal(res.body._id, test_thread_id2)
            assert.property(res.body, 'board')
            assert.equal(res.body.board, test_board2)
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.notEqual(res.body.created_on, res.body.bumped_on)
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, reply_num+1)
            assert.property(res.body.replies[reply_num], '_id')
            test_reply_id[reply_num] = res.body.replies[reply_num]._id
            assert.property(res.body.replies[reply_num], 'text')
            assert.equal(res.body.replies[reply_num].text, test_reply_text)
            assert.property(res.body.replies[reply_num], 'created_on')
            assert.equal(res.body.bumped_on, res.body.replies[reply_num].created_on)
            assert.property(res.body.replies[reply_num], 'reported')
            assert.isFalse(res.body.replies[reply_num].reported)
            done()
          })
      })
      
    });
    
    suite('GET', function() {
        
      test('Get an entire thread with all its replies', function(done) {
        
        chai.request(server)
          .get('/api/replies/' + test_board2)
          .query({
            thread_id: test_thread_id2
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.body.reported, undefined)
            assert.equal(res.body.delete_password, undefined)
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, 4)
            assert.equal(res.body.replies[0]._id, test_reply_id[0])
            assert.equal(res.body.replies[1]._id, test_reply_id[1])
            assert.equal(res.body.replies[2]._id, test_reply_id[2])
            assert.equal(res.body.replies[3]._id, test_reply_id[3])
            done()
          })
      })
      
    });
    
    suite('PUT', function() {
      
      test('Report a reply with wrong id', function(done) {
        
        chai.request(server)
          .put('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            reply_id: test_thread_id2    // incorrect reply_id
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'query without results')
            done()
          })
      })
      
      test('Report the last reply of the thread', function(done) {
        
        chai.request(server)
          .put('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            reply_id: test_reply_id[reply_num]
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
          })
      })
      
    });
    
    suite('DELETE', function() {
      
      test('Delete the second reply of the thread with a wrong password', function(done) {
        
        chai.request(server)
          .delete('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            reply_id: test_reply_id[1],
            delete_password: '1234'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'query without results')
            done()
          })
      })
      
      test('Delete the second reply of the thread with a wrong reply id', function(done) {
        
        chai.request(server)
          .delete('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            reply_id: test_thread_id,
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'query without results')
            done()
          })
      })
      
      test('Delete the second reply of the thread', function(done) {
        
        chai.request(server)
          .delete('/api/replies/' + test_board2)
          .send({
            thread_id: test_thread_id2,
            reply_id: test_reply_id[1],
            delete_password: test_delete_password
          })
          .end(function(err, res) {
            reply_num--
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
          })
      })
      
      test('Check the current replies of the thread', function(done) {
        
        chai.request(server)
          .get('/api/replies/' + test_board2)
          .query({ thread_id: test_thread_id2 })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.body._id, test_thread_id2)
            assert.isArray(res.body.replies)
            assert.equal(res.body.replies.length, reply_num+1)
            assert.equal(res.body.replies[0]._id, test_reply_id[0])
            assert.equal(res.body.replies[1]._id, test_reply_id[2])
            assert.equal(res.body.replies[2]._id, test_reply_id[3])
            done()
          })
      })
      
      
    });
    
    
  });

});
