var AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-2",
    endpoint: "https://dynamodb.us-east-2.amazonaws.com"
})

var docClient = new AWS.DynamoDB.DocumentClient();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/getMember/:player_id', function(req, res) {
    value = req.params.player_id;
    console.log(value);
    Table = "MEMBER";
    player_id = "" + value;

    var params = {
        TableName : Table,
        Key: {
            "player_id": player_id,
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.send(data);
        }
    });
});

app.get('/getLFM/:player_post_id', function(req, res) {
    value = req.params.player_post_id;
    console.log(value);
    Table = "LFM_POST";
    player_post_id = "" + value

    var params = {
        TableName : Table,
        Key: {
            "player_post_id": player_post_id,
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.send(data);
        }
    });
});

app.get('/getLFG/:player_post_id', function(req, res) {
    value = req.params.player_post_id;
    console.log(value);
    Table = "LFG_POST";
    player_post_id = "" + value

    var params = {
        TableName : Table,
        Key: {
            "player_post_id": player_post_id,
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.send(data);
        }
    });
});

app.get('/getInvite/:player_id', function(req, res) {
    value = req.params.player_id;
    console.log(value);
    Table = "INVITE";
    player_id = "" + value

    var params = {
        TableName : Table,
        Key: {
            "player_id": player_id,
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.send(data);
        }
    });
});

app.get('/getGroup/:group_id', function(req, res) {
    value = req.params.group_id;
    console.log(value);
    Table = "GROUP";
    group_id = "" + value

    var params = {
        TableName : Table,
        Key: {
            "group_id": group_id,
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.send(data);
        }
    });
});

app.get('/getApplication/:player_id', function(req, res) {
    value = req.params.player_id;
    console.log(value);
    Table = "APPLICATION";
    player_id = "" + value

    var params = {
        TableName : Table,
        Key: {
            "player_id": player_id,
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.send(data);
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
