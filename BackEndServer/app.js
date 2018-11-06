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

app.post('/getLFM', function(req, res) {
    console.log("Request: = ");
    Table = "LFM_POST";

    var params = {
        TableName : Table,
        ProjectionExpression: "#gt,#reg,#st,#dp",
        FilterExpression:
            "#gt = :game AND #req = :region AND #st = :session AND #dp = :display",
        ExpressionAttributeNames: {
            "#gt": "gameType",
            "#reg" : "region",
            "#st" : "sessionType",
            "#dp" : "displayPosts",
        },
        ExpressionAttributeValues: {
            ":game" : query.gameType,
            ":region" : query.region,
            ":session" : query.sessionType,
            ":display" : query.displayPosts,

        }
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function (movie) {
                console.log(
                    movie.year + ": ",
                    movie.title, "- rating:", movie.info.rating);
            });

            // continue scanning if we have more movies, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }
    }
});

/*
app.get('/getLFM/:player_post_id', function(req, res) {
    console.log("Request: = ");
    value = req.params.player_post_id;
    //console.log(value);
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
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            res.send(data);
        }
    });
});
*/
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
