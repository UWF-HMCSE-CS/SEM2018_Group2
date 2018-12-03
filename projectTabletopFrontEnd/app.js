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
const baseURL = credentials.apiURL;
const header = {'Content-Type': 'application/json'};

// TODO move postList and filters to req.session
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
    
	res.render('layouts/posts', params);
});

// sends search request to backend, redirects to landing page for display
app.get('/search', function(req, res) {
    
    currentFilters = req.query;
    
	let request = JSON.stringify(req.query);
    fetch(baseURL + "/getPosts", {method: "post", body: request, headers: header})
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
    
	let request = JSON.stringify({user: req.body.username});
	
    fetch(baseURL + "/getMember", {method: "post", body: request, headers: header})
    .then(res => res.json())
    .then(function(json) {
        console.log(json);
        
        let passwordOK = false;
        let errormsg;
    
        if (json.status == 'success') {
            // user exists, so check the password
            if (bcrypt.compareSync(req.body.password, json.data.password)) {
                // password is correct
                passwordOK = true;
                req.session.user = json.data.username;
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

// register a new user
app.post('/register', function(req, res) {
    
	let request = JSON.stringify({user: req.body.newuser});
	
	// check to see if the username is taken
    fetch(baseURL + "/getMember", {method: "post", body: request, headers: header})
    .then(res => res.json())
    .then(function(json) {
    
        if (json.status != 'success') {
            // username is available, so go ahead
            let request = req.body;
            let postType = "MEMBER";
            
            // TODO encrypt password
            
        	let postPackage = {table: postType, params: request};
        	
        	postPackage = JSON.stringify(postPackage);
            fetch(baseURL + "/add", {method: "post", body: postPackage, headers: header})
            .then(res => res.json())
            .then(function(json) {
                console.log(json);
                
        		res.redirect('/');
            })
            .catch(function(err) {
            	console.log(err.message);
            });
        } else {
            res.render('/#register', {error: "That username is unavailable"});
        }
    })
    .catch(function(err) {
    	console.log(err.message);
    });
});

// sends post request to backend, redirects to landing page when done
app.post('/createPost', authOnly, function(req, res) {
    
    let postData = req.body;
    let postType = (postData.postType + "_POST");
    delete postData.postType;
    
	let thisDate = new Date();
	let month = thisDate.getUTCMonth() + 1;
	let day = thisDate.getUTCDate();
	let year = thisDate.getUTCFullYear();
	let currentDate = year + "/" + month + "/" + day;
	
	postData.date = currentDate;
	
	// TODO change schedule format from [days] to "0110101"
	// TODO fill in missing checkbox fields with false
	
	let postPackage = {table: postType, params: postData};
	
	postPackage = JSON.stringify(postPackage);
	
	console.log(postPackage);
	
    fetch(baseURL + "/add", {method: "post", body: postPackage, headers: header})
    .then(res => res.json())
    .then(function(json) {
        console.log(json);
        
        if (json.status == "success") {
            postList.push(postData);
        }
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