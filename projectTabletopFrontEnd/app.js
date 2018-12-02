const express = require('express');
const bcrypt = require('bcryptjs');
const fetch = require("node-fetch");
const credentials = require('./credentials.js');

let app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

// set up body parser
const bp = require("body-parser");
app.use(bp.urlencoded( {extended: false} ));

// set up cookie parser
const cookieparser = require('cookie-parser');
app.use(cookieparser(credentials.cookieSecret));

// set up express session
const exp_session = require('express-session');
app.use(exp_session({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));

// set up handlebars view engine
let handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


// GLOBALS
//const baseURL = "https://tabletopserver-env.nsfmpmmpw3.us-east-2.elasticbeanstalk.com";
const baseURL = "https://main-lm88.c9users.io";
const header = {'Content-Type': 'application/json'};

let currentFilters = {};
let postList = [];

// authentication verification middleware
const authOnly = function(req, res, next) {
    if (req.session.user != null)
        next();
    else
        res.redirect('/');
};

// ROUTES

// Renders the landing page
app.get('/', function(req, res) {
    let isAuth = false;
    if (req.session.user != null) {
        isAuth = true;
    }
    
    const params = {
        post: postList,
        filters: currentFilters,
        auth: isAuth
    };
    
	res.render('layouts/lfmPosts', params);
});

// sends search request to backend, redirects to landing page for display
app.get('/search', function(req, res) {
    
    currentFilters = req.query;
	
	let request = JSON.stringify(req.query);
    fetch(baseURL + "/getLFM", {method: "post", body: request, headers: {'Content-Type': 'application/json'}})
        .then(res => res.json())
        .then(function(json) {
            postList = json;
            console.log(postList);
            
			res.redirect('/');
        })
        .catch(function(err) {
        	console.log(err.message);
        });
});

// sign in authentication
app.post('/signin', function(req, res) {
    
    // json will end up null if the username was not found
	let request = JSON.stringify({user: req.body.username});
    fetch(baseURL + "/getMember", {method: "post", body: request, headers: header})
    .then(res => res.json())
    .then(function(json) {
        console.log(json);
        
        let passwordOK = false;
        let errormsg;
    
        if (json != undefined) {
            // user exists, so check the password
            if (bcrypt.compareSync(req.body.password, json.password)) {
                // password is correct
                passwordOK = true;
                req.session.user = json.username;
            } else {
                errormsg = 'Password is incorrect, please try again.';
            }
        } else {
            errormsg = 'Username not found.';
        }
        
        if (passwordOK) {
            // send to top page
            res.redirect('/');
        } else {
            // re-display login page with error message
            res.render('/#signin', { error: errormsg });
        }
    })
    .catch(function(err) {
    	console.log(err.message);
    });
});

// sends post request to backend, redirects to landing page when done
app.post('/createLfmPost', authOnly, function(req, res) {
	let thisDate = new Date();
	let month = thisDate.getUTCMonth() + 1;
	let day = thisDate.getUTCDate();
	let year = thisDate.getUTCFullYear();
	let currentDate = year + "/" + month + "/" + day;
	
	req.body.date = currentDate;
	
	let request = JSON.stringify(req.body);
    fetch(baseURL + "/populateLfmPost", {method: "post", body: request, headers: header})
    .then(res => res.json())
    .then(function(json) {
        console.log(json);
        postList.push(json);
        
		res.redirect('/');
    })
    .catch(function(err) {
    	console.log(err.message);
    });
});


// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});