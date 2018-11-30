const express = require('express');

let app = express();
let postsService = require("./lib/postsService.js");
let currentFilters = {};
let postList = [];

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
	currentFilters = req.query;
	postList = postsService.getFilteredPosts(currentFilters);
	
	res.redirect('/');
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
	
	let somePost = postsService.sendLfmPost(req.body);
	somePost = JSON.parse(somePost);
	postList.push(somePost);
	
	res.redirect('/');
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