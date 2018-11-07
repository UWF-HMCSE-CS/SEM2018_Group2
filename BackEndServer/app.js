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

app.post('/getMember', function(req, res) {
    Table = "MEMBER";

    var params = {
        TableName : Table,
        ProjectionExpression: "#zip, email, first_name, last_name, password, username, player_id",
        FilterExpression:
            "#zip = :zip",
        ExpressionAttributeNames: {
            "#zip": "zip_code",
        },
        ExpressionAttributeValues: {
            ":zip" : req.body.zip_code,
        }
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function (mem) {
                console.log("player id = " + mem.player_id);
            });
            res.send(data);

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


app.post('/getLFG', function(req, res) {
    Table = "LFG_POST";

    var params = {
        TableName : Table,
        ProjectionExpression: "#gt, char_lvl, description, DM, num_players, player_post_id, schedule", //"#gt,#reg,#st,#dp",
        FilterExpression:
            "#gt = :game",//"#gt = :game AND #req = :region AND #st = :session AND #dp = :display",
        ExpressionAttributeNames: {
            "#gt": "game_type",
            //"#reg" : "region",
            //"#st" : "sessionType",
            //"#dp" : "displayPosts",
        },
        ExpressionAttributeValues: {
            ":game" : req.body.game_type,
            //":region" : query.region,
            //":session" : query.sessionType,
            //":display" : query.displayPosts,

        }
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function (LFM_POST) {
                console.log("player id = " + LFM_POST.player_post_id);
            });
            res.send(data);

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

app.post('/getLFM', function(req, res) {
    Table = "LFM_POST";

    var params = {
        TableName : Table,
        ProjectionExpression: "#gt, char_lvl, description, DM, num_players, player_post_id, schedule", //"#gt,#reg,#st,#dp",
        FilterExpression:
            "#gt = :game",//"#gt = :game AND #req = :region AND #st = :session AND #dp = :display",
        ExpressionAttributeNames: {
            "#gt": "game_type",
            //"#reg" : "region",
            //"#st" : "sessionType",
            //"#dp" : "displayPosts",
        },
        ExpressionAttributeValues: {
            ":game" : req.body.game_type,
            //":region" : query.region,
            //":session" : query.sessionType,
            //":display" : query.displayPosts,

        }
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function (LFM_POST) {
                console.log("post id = " + LFM_POST.player_post_id);
            });
            res.send(data);

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

app.post('/getInvite', function(req, res) {
    Table = "INVITE";

    var params = {
        TableName : Table,
        ProjectionExpression: "#id, link, msg", //"#gt,#reg,#st,#dp",
        FilterExpression:
            "#id = :player",//"#gt = :game AND #req = :region AND #st = :session AND #dp = :display",
        ExpressionAttributeNames: {
            "#id": "player_id",
        },
        ExpressionAttributeValues: {
            ":player" : req.body.player_id,
 }
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function (invite) {
                console.log("player id = " + invite.player_id);
            });
            res.send(data);

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

app.post('/getGroup', function(req, res) {
    Table = "GROUP";

    var params = {
        TableName : Table,
        ProjectionExpression: "#id, player_id",
        FilterExpression:
            "#id = :group",
        ExpressionAttributeNames: {
            "#id": "group_id",
        },
        ExpressionAttributeValues: {
            ":group" : req.body.group_id,
        }
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function (group) {
                console.log("player id = " + group.player_id);
            });
            res.send(data);

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

app.post('/getApplication', function(req, res) {
    Table = "GROUP";

    var params = {
        TableName : Table,
        ProjectionExpression: "#id",
        FilterExpression:
            "#id = :player",
        ExpressionAttributeNames: {
            "#id": "player_id",
        },
        ExpressionAttributeValues: {
            ":player" : reg.body.player_id,
        }
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // print all the movies
            console.log("Scan succeeded.");
            data.Items.forEach(function (application) {
                console.log("player id = " + application.player_id);
            });
            res.send(data);

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
