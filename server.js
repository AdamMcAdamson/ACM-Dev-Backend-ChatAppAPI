/*
    To setup, deploy and test ACM-Dev-Backend-ChatAppApi:
    ------------------------------------------------------------------------------

    @Server (Heroku):
    ----------------------------------------
    Install Git and Heroku CLI.
    Clone this Github repository to your local device.
    Run npm install.
    Set @dbName and @collectionName accordingly (see @Database below for details);
    Add and commit the changes to your clone repository.
    Create a Heroku remote. (heroku create -> git remote -v)
    Push the repository to your heroku remote (git push heroku master).

    Follow https://devcenter.heroku.com/articles/git for more specific details.


    @Database (MongoDB Atlas):
    ----------------------------------------
    Deploy a MongoDB cluster over the cloud (Atlas..).
    Setup database {dbName} with a collection {collectionName}.
    Add your server's IP address to your cluster's IP access list.
    Create a database user for the cluster with read-write permissions to {dbName}@{collectionName} 
    Enter the MongoDB connection URI for your database user (@uri) in uri.js.
    Set @dbName and @collectionName accordingly;

    Follow https://docs.atlas.mongodb.com/getting-started/ for more specific details.

    @Testing:
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
        Chat2   (Sender2)
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

    // verify the existence of the request's body data
    if(req.body.chat_id == null){
        res.statusMessage = "Invalid request, must include a chat_id!";
        res.status(400).end();
        return;
    }  else if(req.body.sender == null){
        res.statusMessage = "Invalid request, must include a sender!";
        res.status(400).end();
        return;
    }

    // get body data, ensuring proper formatting by removing invalid characters
    var chat_id = req.body.chat_id.replace(anRegex, '');
    var sender = req.body.sender.replace(anRegex, '');
    var message = req.body.message;

    // invalid chat_id or sender
    if (chat_id == ""){
        res.statusMessage = "Invalid chat_id, alphanumeric, non-blank chat_ids only!";
        res.status(400).end();
        return;
    } else if(sender == ""){
        res.statusMessage = "Invalid sender, alphanumeric, non-blank sender names only!";
        res.status(400).end();
        return;
    }



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
        const collection = client.db("chatappDB").collection("chatrooms");
        collection.updateOne({'_id':chat_id},{$push:{'messages':messageObj}},{upsert: true}, (err, result) => {
            res.send(result);
        });
    });
});

// read_messages endpoint ((POST) by HTTP Request specifications)
app.post('/read_messages', (req, res) => {

    // verify the existence of the request's chat_id
    if(req.body.chat_id == null){
        res.statusMessage = "Invalid request, must include a chat_id!";
        res.status(400).end();
        return;
    }

    var chat_id = req.body.chat_id.replace(anRegex, '');
    var sender = req.body.sender;

    // invalid chat_id or sender
    if(chat_id == ""){
        res.statusMessage = "Invalid chat_id, alphanumeric, non-blank sender names only!";
        res.status(400).end();
        return;   
    } else if(sender != null && sender.match(anRegex) != null) {
        res.statusMessage = "Invalid sender, alphanumeric, sender names only!";
        res.status(400).end();
        return;
    }

    const connect = connection;

    // when connected, grab messages of the specified sender (or all messages, if not specified) from the given chatroom,.
    connect.then(async() => {

        // grab chatrooms collection
        const collection = client.db("chatappDB").collection("chatrooms");

        if(sender == null || sender == ""){     // return the entire chatroom document (all messages)
            const out = await collection.findOne({_id: chat_id});
            res.send(out);        
        } 
        else {                                  // return the messages from the specified sender
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
