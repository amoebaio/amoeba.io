#Amoeba

##About


##Instalation

```npm install amoeba.io```

##Usage
###Socket client-server application
Install modules
```
npm install socket.io amoeba.io amoeba.io-local-client amoeba.io-socket-server 
```
Create server
```javascript
//File server.js
var ServerIO = require('socket.io');
var Amoeba = require("amoeba.io");
var LocalClient = require("amoeba.io-local-client");
var SocketServer = require("amoeba.io-socket-server");
//Service class
Auth = function() {};

Auth.prototype.login = function(data, callback) {
    if (data.login == "admin" && data.password == "pass") {
        callback(null, {
            "res": "login ok"
        });
    } else {
        callback({
            "res": "login fail"
        }, null);
    }
};

//Create amoeba instance
amoeba = new Amoeba();
//Add service to amoeba
amoeba.service("auth", new LocalClient(new Auth()));

//Create socket server
var port = "8090";
io = new ServerIO();
io.listen(port).on('connection', function(socket) {
  //All services now you can use thru socket 
  amoeba.server(new SocketServer(socket));
});
```
Start server
```
node server
```

Create client
```html
<!DOCTYPE html>
<html>

<head>
    <title>Browser Amoeba test</title>
    <meta charset="utf-8">

    <link rel="stylesheet" href="http://code.jquery.com/qunit/qunit-1.17.1.css">

    <script type="text/javascript" src="js/socket.io.js"></script>
    <script type="text/javascript" src="js/amoeba.io.min.js"></script>
    <script type="text/javascript" src="js/amoeba.io-socket-client.js"></script>
    <script type="text/javascript">
      var socket = io('http://localhost:8090');
      var amoeba = new Amoeba();
      socket.on('connect', function() {
        amoeba.service("auth", new SocketClient(socket));
        amoeba.service("auth").invoke("login", {
                login: 'admin',
                password: 'pass'
            }, function(err, data) {
              //Do somethong
            });
      }
    </script>
</head>

<body>
</body>

</html>
```
