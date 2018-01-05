'use strict';

const express = require('express');
var app = express();

const PORT = process.env.PORT || 3000;
var http = require('http').Server(app);
var io = require('socket.io')(http);

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dburl = 'mongodb://louis:louisnow117@ds115085.mlab.com:15085/louismongo';
// const dburl = 'mongodb://localhost:27017/nxj';

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

MongoClient.connect(dburl, function (err, db) {
    assert.equal(null, err);
    console.log('Successfully connected to server...');

    var users = [];

    io.on('connection', function (socket) {
        console.log('a user connected');

        db.collection('nxj_birthday').find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            socket.emit('loadMessages', docs);
        });

        socket.on('userLogin', function (loginInfo) {
            if (users.indexOf(loginInfo.username) < 0) {
                socket.userIndex = users.length;
                users.push(loginInfo.username);
            }
            io.emit('userLogin', { 'loginInfo': loginInfo, online: users.length });
        });

        socket.on('chatMessage', function (msg) {
            // console.log('message: ' + msg);
            db.collection('nxj_birthday').insertOne(msg, function (err, res) {
                console.log('successfully insert one document.');
            });
            // send messages to others
            socket.broadcast.emit('chatMessage', msg);
        });

        socket.on('disconnect', function () {
            var username = users[socket.userIndex];
            users.splice(socket.userIndex, 1);
            io.emit('userLogout', { 'username': username, 'online': users.length });
            console.log('user disconnected');
        });
    });
});

// io.on('connection', function(socket){
//     console.log('a user connected');

//     socket.on('chat message', function(msg){
//         // console.log('message: ' + msg);
//         io.emit('chat message', msg);
//     });

//     socket.on('disconnect', function(){
//         console.log('user disconnected');
//     });
// });

http.listen(PORT, function () {
    console.log('magic happens in: ' + PORT);
});