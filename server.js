const express = require('express');
const { MongoClient } = require('mongodb');

// uri.js: module.exports = "<INSERT MongoDB Altas URI HERE>"
const uri = require('./uri');

const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = client.connect();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/send_message', (req, res) => {
    var chat_id = req.body.chat_id;
    var sender = req.body.sender;
    var message = req.body.message; 

    console.log("POST at send_message RECIEVED:\nchat_id: " + chat_id + "\t sender: " + sender + "\t message: " + message);

    var arrObj = {
        timestamp: Date.now(),
        sender: sender,
        message: message
    }

    const connect = connection;
    connect.then(() => {
        console.log("CONNECTED TO DB");
        const collection = client.db("chatappDB").collection("chatrooms");
        collection.updateOne({'_id':chat_id},{$push:{'messages':arrObj}},{upsert: true}, (err, result) => {
            res.send(result);
        });
    });
});

app.post('/read_messages', (req, res) => {
    var chat_id = req.body.chat_id;
    var sender = req.body.sender;

    console.log("POST at read_messages RECIEVED:\nchat_id: " + chat_id + "\t sender: " + sender);

    const connect = connection;
    connect.then(async() => {
        const collection = client.db("chatappDB").collection("chatrooms");
        if(sender == null){
            console.log("Sender == null");
            const out = await collection.findOne({_id: chat_id});
            res.send(out);
            //.toArray((err, result)=> {
            //    res.send(result[0]);
            //});           
        } else {
            console.log("Sender == " + sender);
            // const out = await collection.findOne({_id: chat_id, 'messages.sender' : sender}, {"messages.$" : 1});
            // res.send(out)
            // collection.find({_id: chat_id, 'messages.sender' : sender}, {"messages.$" : 1}).toArray((err, out) =>{
            //     res.send(out)
            // });
            /*
            const out = await collection.aggregate([
                {
                    $project: {
                        messages: {
                            $filter: {
                                input: "$details",
                                as: "out",
                                cond: { $eq:["$$out.sender", sender] }
                            }
                        }
                   }
                }
            ])*/
            collection.find(
                { _id : chat_id },
                { messages : { $elemMatch : { sender : sender } } }
              ).toArray((err, out) => {
                  res.send(out);
              });
            //res.send(out);
        }
    });

});

app.listen(port, () => {
    console.log(`App listening at port: ${port}`);
});

