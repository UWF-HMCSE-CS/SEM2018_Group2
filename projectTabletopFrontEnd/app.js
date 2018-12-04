const express = require('express');
const bcrypt = require('bcryptjs');
const fetch = require("node-fetch");
const morgan = require('morgan');
const credentials = require('./credentials.js');

let app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));

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
    
    const params = {
        post: req.session.postsList,
        filters: req.session.currentFilters,
        auth: false
    };
    
    if (req.session.user != null) {
        
        params.auth = true;
        params.name = req.session.user.first_name + " " + req.session.user.last_name;
        
	    res.render('layouts/posts', params);		
    } else {
        if (req.session.postsList == null) {
            
            // populate initial page with a simple query
            let request = {
                game_type: "dnd",
                post_type: "lfm"
            };
            
            request = JSON.stringify(request);
            fetch(baseURL + "/getPosts", {method: "post", body: request, headers: header})
                .then(res => res.json())
                .then(function(json) {
                    
                    req.session.postsList = json.Items;
                    params.post = json.Items;
                    
                	res.redirect('/');
                })
                .catch(function(err) {
                	console.log(err.message);
                });
        } else {
    	    res.render('layouts/posts', params);
        }
    }
});

// sends search request to backend, redirects to landing page for display
app.get('/search', function(req, res) {
    
    let request = req.query;
    req.session.currentFilters = request;
    delete request.post_count;
    
	request = JSON.stringify(request);
    
    fetch(baseURL + "/getPosts", {method: "post", body: request, headers: header})
        .then(res => res.json())
        .then(function(json) {
            req.session.postsList = json.Items;
            
			res.redirect('/');
        })
        .catch(function(err) {
        	console.log(err.message);
        });
});

// sign in authentication
app.post('/signin', function(req, res) {
    
	let request = { user: req.body.username };
	request = JSON.stringify(request);
	
    fetch(baseURL + "/getMember", {method: "post", body: request, headers: header})
    .then(res => res.json())
    .then(function(json) {
        
        let passwordOK = false;
        let errormsg;
    
        if (json.Count == 1) {
            // user exists, so check the password
            if (bcrypt.compareSync(req.body.password, json.Items[0].password)) {
                // password is correct
                passwordOK = true;
                req.session.user = json.Items[0];
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
            res.redirect('/');
        }
    })
    .catch(function(err) {
    	console.log(err.message);
    });
});

// remove authentication from a user
app.get('/logout', function(req, res) {
    delete req.session.user;
    res.redirect('/');
});

// register a new user
app.post('/register', function(req, res) {
    
	let request = { user: req.body.newuser };
	request = JSON.stringify(request);
	
	// check to see if the username is taken
    fetch(baseURL + "/getMember", {method: "post", body: request, headers: header})
    .then(res => res.json())
    .then(function(json) {
        if (json.status != 'success') {
            // username is available, so go ahead
            let request = req.body;
            let postType = "MEMBER";
            
            // encrypt password
            if (request.password1 === request.password2) {
            
                let salt = bcrypt.genSaltSync(10);
                request.password = bcrypt.hashSync(request.password1, salt);
                
                delete request.password1;
                delete request.password2;
                
            	let postPackage = {table: postType, params: request};
            	postPackage = JSON.stringify(postPackage);
            	
                fetch(baseURL + "/add", {method: "post", body: postPackage, headers: header})
                .then(res => res.json())
                .then(function(json) {
                    
            		res.redirect('/');
                })
                .catch(function(err) {
                	console.log(err.message);
                });
            } else {
                res.render('layouts/posts', {error: "register", errormsg: "Passwords must match"});
            }
        } else {
            res.render('layouts/posts', {error: "register", errormsg: "That username is unavailable"});
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
    
	let thisDate = new Date();
	let month = thisDate.getUTCMonth() + 1;
	let day = thisDate.getUTCDate();
	let year = thisDate.getUTCFullYear();
	let currentDate = year + "/" + month + "/" + day;
	
	postData.date = currentDate;
	
	// set null fields to false
	if (req.body.novice == null) {
	    req.body.novice = false;
	}
	if (postData.postType == "lfm") {
    	if (req.body.homebrew == null) {
    	    req.body.homebrew = false;
    	}
	} else {
    	if (req.body.DM == null) {
    	    req.body.DM = false;
    	}
	}
	
	// converts array of strings named req.body.schedule into an array of integers named intArray
	let intArray = [0,0,0,0,0,0,0];
	for (let i = 0; i < (req.body.schedule).length; ++i) {
	    switch(req.body.schedule[i]) {
            case "sunday":
                intArray[0] = 1;
                break;
	        case "monday":
	            intArray[1] = 1;
	            break;
	        case "tuesday":
	            intArray[2] = 1;
	            break;
            case "wednesday":
                intArray[3] = 1;
                break;
            case "thursday":
                intArray[4] = 1;
                break;
            case "friday":
                intArray[5] = 1;
                break;
            case "saturday":
                intArray[6] = 1;
                break;
	    }
	}
	
	// converts array of integers named intArray into a string of binary numbers
	let binaryString = "";
	for (let i = 0; i < intArray.length; ++i) {
        if (intArray[i] == 0) {
            binaryString = binaryString + "0";
        } else {
            binaryString = binaryString + "1";
        }
	}
	
	req.body.schedule = binaryString;
	
    delete postData.postType;
	let postPackage = {table: postType, params: postData};
	
	postPackage = JSON.stringify(postPackage);
	
    fetch(baseURL + "/add", {method: "post", body: postPackage, headers: header})
    .then(res => res.json())
    .then(function(json) {
        
        if (json.status == "success") {
            req.session.postsList.push(postData);
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