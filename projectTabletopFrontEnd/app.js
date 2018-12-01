const express = require('express');

let app = express();
let currentFilters = {};
let postList = [];
let fetch = require("node-fetch");
//let baseURL = "https://tabletopserver-env.nsfmpmmpw3.us-east-2.elasticbeanstalk.com";
let baseURL = "https://main-lm88.c9users.io";

let bp = require("body-parser");
app.use(bp.urlencoded( {extended: false} ));

// set up handlebars view engine
let handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

// Renders the landing page
app.get('/', function(req, res) {
	res.render('layouts/lfmPosts', {post: postList, filters: currentFilters});
});

// sends search request to backend, redirects to landing page for display
app.get('/results', function(req, res) {
	
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

app.post('/signin', function(req, res) {
    console.log("sign in attempted");
    
    res.redirect('/');
});

// sends post request to backend, redirects to landing page when done
app.post('/createLfmPost', function(req, res) {
	let thisDate = new Date();
	let month = thisDate.getUTCMonth() + 1;
	let day = thisDate.getUTCDate();
	let year = thisDate.getUTCFullYear();
	let currentDate = year + "/" + month + "/" + day;
	
	req.body.date = currentDate;
	
	let request = JSON.stringify(req.body);
    fetch(baseURL + "/populateLfmPost", {method: "post", body: request, headers: {'Content-Type': 'application/json'}})
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