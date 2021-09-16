/*
    To setup, deploy ant test ACM-Dev-Backend-ChatAppApi:
    ------------------------------------------------------------------------------

    Server (Heroku):
    ----------------------------------------
    Install Git and Heroku CLI.
    Clone this Github repository to your local device.
    Run npm install.
    Create a Heroku remote. (heroku create -> git remote -v)
    Push the repository to your heroku remote (git push heroku master).
    Follow https://devcenter.heroku.com/articles/git for more specific details.


    Database (MongoDB Atlas):
    ----------------------------------------
    Deploy a MongoDB cluster over the cloud (Atlas..).
    Setup database {dbName} with a collection {collectionName}.
    Setup database user for the cluster with read-write permissions to {dbName}@{collectionName} 
    Enter the MongoDB connection URI (@uri) in uri.js.
    Set @dbName and @collectionName accordingly;

    Testing:
    ----------------------------------------
    Using an API Testing tool such Postman or Insomia.
    Send POST requests to the send_messages and read_messages endpoints as specified:

        send_messages:                      read_messages:       
        req.body = {                        req.body = {
            chat_id: {chat_id},                 chat_id: {chat_id},
            sender: {sender},                   sender: {?sender},
            message: {message}              }
        } 

    For convience, my server deployment is located at:
    https://backend-chat-app-api.herokuapp.com/
    
    So you can use the endpoints:
        https://backend-chat-app-api.herokuapp.com/read_messages
      and
        https://backend-chat-app-api.herokuapp.com/send_messages
    
    Existing chatrooms at the time of creation <[{chat_ids} ([senders])]>:
        Chat1   (Sender1, Sender2, Sender3)
    ------------------------------------------------------------------------------
*/

// require node modules
const express = require('express');
const { MongoClient } = require('mongodb');

// @uri - uri.js: module.exports = "<INSERT MongoDB Altas URI HERE>"
const uri = require('./uri');

// express app setup
const app = express();
const port = process.env.PORT || 3000;

// setup database client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = "chatappDB";             // @dbName:         enter MongoDB database name
const collectionName = "chatrooms";     // @collectionName: enter MongoDB database's collection name

// connect to database
const connection = client.connect();

// alphanumeric string regex
const anRegex =  /[^\w]+/g;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// For convience to demonstrate server is up and running
/*
app.get('/', (req, res) => {
    res.send('Hello World!')
});
*/

// send_messages endpoint
app.post('/send_message', (req, res) => {

    // get body data, ensuring proper formatting
    var chat_id = req.body.chat_id.replace(anRegex, '');
    var sender = req.body.sender.replace(anRegex, '');
    var message = req.body.message; 

    //console.log("POST at send_message RECIEVED:\nchat_id: " + chat_id + "\t sender: " + sender + "\t message: " + message);

    // message object, to be inserted into proper chatroom document
    var messageObj = {
        timestamp: Date.now(),
        sender: sender,
        message: message
    }

    const connect = connection;

    // when connected, insert into the designated chatroom document,
    // creating a new document if the chatroom doesn't exist yet.
    connect.then(() => {
        console.log("CONNECTED TO DB");
        const collection = client.db("chatappDB").collection("chatrooms");
        collection.updateOne({'_id':chat_id},{$push:{'messages':messageObj}},{upsert: true}, (err, result) => {
            res.send(result);
        });
    });
});

// read_messages endpoint ((POST) by HTTP Request specifications)
app.post('/read_messages', (req, res) => {
    var chat_id = req.body.chat_id.replace(anRegex, '');
    var sender = req.body.sender;

    //debug
    if (sender != null) {console.log(sender.match(anRegex));}

    // invalid sender
    if (sender != null && sender.match(anRegex) != []) {
        res.statusMessage = "Invalid sender, alphanumeric sender names only!";
        res.status(404).end();
        return;
    }

    //console.log("POST at read_messages RECIEVED:\nchat_id: " + chat_id + "\t sender: " + sender);

    const connect = connection;

    // when connected, grab messages of the specified sender (or all messages, if not specified) from the given chatroom,.
    connect.then(async() => {
        
        // grab chatrooms collection
        const collection = client.db("chatappDB").collection("chatrooms");

        if(sender == null){                     // return the entire chatroom document (all messages)
            //console.log("Sender == null");
            const out = await collection.findOne({_id: chat_id});
            res.send(out);        
        } 
        else {                                  // return the messages from the specified sender
            //console.log("Sender == " + sender);
            collection.aggregate([
                { $match: { _id : chat_id } },  // grab correct chatroom document
                {
                    $project: {
                        messages: {
                            $filter: {          // filter messages by the given sender
                                input: "$messages",
                                as: "message",
                                cond: { "$eq" :["$$message.sender", sender] }
                            }
                        }
                   }
                }
            ]).toArray((err, out)=> {
                // return the only document as a document
                if (out.length > 0) { res.send(out[0]); }
                // no chatroom under that id
                else { res.send(); }  
            });
        }
    });
});


// start server
app.listen(port, () => {
    console.log(`App listening at port: ${port}`);
});

