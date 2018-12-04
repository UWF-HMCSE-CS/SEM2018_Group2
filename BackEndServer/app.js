var AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-2",
    endpoint: "https://dynamodb.us-east-2.amazonaws.com"
});

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

function scanner(res, params) {
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Scan succeeded.");
            res.send(data);

            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }
    }
}

app.post('/add', function(req, res) {
    let Table = req.body.table;
    let Items = JSON.parse(req.body.params);
    console.log(req.body.table);
    console.log(req.body.params);
    var params = {
        TableName: Table,
        Item: Items
    };
    
    var svc = new AWS.DynamoDB();
    svc.describeTable(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log(data.Table.ItemCount);
            
            if (params.TableName == 'LFG_POST') {
                params.Item.player_post_id = "lfg" + data.Table.ItemCount;
            } else if (params.TableName == 'LFM_POST') {
                params.Item.player_post_id = "lfm" + data.Table.ItemCount;
            } else {
                params.Item.player_id = data.Table.ItemCount;
            }

            console.log("Adding a new item...");
            docClient.put(params, function (err, data) {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    res.send(JSON.stringify({error: "Unable to add item", message: err}));
                } else {
                    console.log("Added item:", JSON.stringify(data, null, 2));
                    res.send(JSON.stringify({status: "success"}));
                }
            });
        }
    });
});

app.post('/getMember', function(req, res) {
    let Table = "MEMBER";

    let query = "";

    if(req.body.user != null) {
        query += "#us = :username";
        console.log("There is a user");

        var params = {
            TableName : Table,
            ProjectionExpression: "zip_code, email, first_name, last_name, password, #us, player_id",
            FilterExpression:
                query,
            ExpressionAttributeNames: {
                "#us": "username",
            },
            ExpressionAttributeValues: {
                ":username" : req.body.user,
            }
        };

        scanner(res, params);
    }
    else{
        res.send(JSON.stringify({status: "error", message: "username required"}));
    }

});

app.post('/getPosts', function(req, res) {
    console.log(req.body);
    let Table;
    let Expression;
    
	if(req.body.post_type == 'lfm')
	{
		Table = "LFM_POST";
		Expression = "#gt, DM, char_lvl, date, homebrew, novice, description, num_players, player_post_id, schedule";
	}
	else if(req.body.post_type == 'lfg')
	{
		Table = "LFG_POST";
		Expression = "#gt, DM, date, description, skill_lvl, player_post_id, schedule";
	}
	else{
		res.send(JSON.stringify({status: "error", message: "Invalid table type"}));
	}
    var params = {
        TableName : Table,
        ProjectionExpression: Expression,
        FilterExpression:
            "#gt = :game",
        ExpressionAttributeNames: {
            "#gt": "game_type",
        },
        ExpressionAttributeValues: {
            ":game" : req.body.game_type,
        }
    };

    scanner(res,params);
});

app.post('/getInvite', function(req, res) {
    let Table = "INVITE";

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

    scanner(res,params);
});

app.post('/getGroup', function(req, res) {
    let Table = "GROUP";

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

    scanner(res,params);
});

app.post('/getApplication', function(req, res) {
    let Table = "GROUP";

    var params = {
        TableName : Table,
        ProjectionExpression: "#id",
        FilterExpression:
            "#id = :player",
        ExpressionAttributeNames: {
            "#id": "player_id",
        },
        ExpressionAttributeValues: {
            ":player" : req.body.player_id,
        }
    };

    scanner(res,params);
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
