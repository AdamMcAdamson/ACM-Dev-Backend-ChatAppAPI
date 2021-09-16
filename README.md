# ACM-Dev-Challenges
My solution to UT Dallas's ACM Development application: Back-end Challenge A - Chat App API


## To setup, deploy ant test ACM-Dev-Backend-ChatAppApi:
---------------------------------------------------------------

### @Server (Heroku):
----------------------------------------
- Install Git and Heroku CLI.
- Clone this Github repository to your local device.
- Run npm install.
- Set @dbName and @collectionName accordingly (see @Database below for details);
- Add and commit the changes to your clone repository.
- Create a Heroku remote. (heroku create -> git remote -v)
- Push the repository to your heroku remote (git push heroku master).
- Follow https://devcenter.heroku.com/articles/git for more specific details.

### @Database (MongoDB Atlas):
----------------------------------------
- Deploy a MongoDB cluster over the cloud (Atlas..).
- Setup database {dbName} with a collection {collectionName}.
- Add your server's IP address to your cluster's IP access list.
- Create a database user for the cluster with read-write permissions to {dbName}@{collectionName} 
- Enter the MongoDB connection URI for your database user (@uri) in uri.js.
- Set @dbName and @collectionName accordingly;
-Follow https://docs.atlas.mongodb.com/getting-started/ for more specific details.

### @Testing:
----------------------------------------
- Using an API Testing tool such Postman or Insomia.
- Send POST requests to the send_messages and read_messages endpoints as specified:
    ```json
    send_messages:                      read_messages:       
    req.body = {                        req.body = {
        chat_id: {chat_id},                 chat_id: {chat_id},
        sender: {sender},                   sender: {?sender},
        message: {message}              }
    }
    ```
- For convience, my server deployment is located at: https://backend-chat-app-api.herokuapp.com/

- So you can use the endpoints:
    https://backend-chat-app-api.herokuapp.com/read_messages
  and
    https://backend-chat-app-api.herokuapp.com/send_messages

Existing chatrooms at the time of creation <[{chat_ids} ([senders])]>:
    - Chat1   (Sender1, Sender2, Sender3)
    - Chat2   (Sender2)
------------------------------------------------------------------------------
