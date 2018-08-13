const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat',function(err,db){
    if(err){
        throw err;
    }
    console.log('mongo db connected...');

    //connect to socket.io
    client.on('connection',function(socket){
        let chat = db.collection('chats');

    //function to send status
    sendstatus = function(s){
            socket.emit('status', s);
        }

    //get chats from mongo
    chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
            if(err){
                throw err;
            }

            socket.emit('output',res);
        });
    //handle input events
    socket.on('input',function(data){
            let name = data.name;
            let message = data.message;

            //check fpr name and msg
            if(name == '' || message == ''){
                //send error
                sendstatus('Please enter name and message');
            } else
            {
                //insert method
                chat.insert({name:name, message: message}, function(){
                        client.emit('output',[data]);

                //send status obj
                    sendstatus({
                        message: 'message sent',
                        clear: true
                    })
                });
            }
        });

        //handling clear

        socket.on('clear',function(data){
            //remove all chats from collections
            chat.remove({},function(){
                //emit cleared
                socket.emit('cleared');
            });
        });
    });
});