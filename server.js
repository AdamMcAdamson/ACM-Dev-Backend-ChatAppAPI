const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const router = express.Router();

// TODO: replace <password> and grab uri from .getignore'd file.
// uri_ex = "mongodb+srv://abDBaccess:<password>@cluster0.vsy9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = "mongodb+srv://abDBaccess:<password>@cluster0.vsy9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/send_message', (req, res) => {
    var chat_id = res.body.chat_id;
    var sender = res.body.sender;
    var message = res.body.message; 

    console.log("POST at send_message RECIEVED:\nchat_id: " + chat_id + "\t sender: " + sender + "\t message: " + message);

    res.send('send_message Response');
});

app.get('/read_messages', (req, res) => {
    var chat_id = res.body.chat_id;
    var sender = res.body.sender;

    console.log("GET at read_messages RECIEVED:\nchat_id: " + chat_id + "\t sender: " + sender);

    res.send('read_messages Response');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

/*
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/