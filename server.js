'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const mongo = require('mongodb').MongoClient;

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

// connect to mongodb

mongo.connect('mongodb://louis:louisnow117@ds115085.mlab.com:15085/louismongo', function(err, db){
    if(err){
        throw err;
    }

    console.log('mongodb connected...')

    io.on('connection', function(socket){
        console.log('client conected...');

        let chat = db.collection('nxj_birthday');

        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            socket.emit('output', res);
        });

        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            if(name == '' || message == ''){
                console.log('Please enter a name and message.');
            } else {
                chat.insert({name: name, message: message}, function(){
                    io.emit('output', [data]);
                });
            }
        });



        socket.on('disconnected', () => console.log('client disconnected...'));
    })
})

// io.on('connection', (socket) => {
//   console.log('Client connected');
//   socket.on('disconnect', () => console.log('Client disconnected'));
// });

// setInterval(() => io.emit('time', new Date().toTimeString()), 1000);