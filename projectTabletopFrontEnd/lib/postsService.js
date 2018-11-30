let fetch = require("node-fetch");
//let baseURL = "https://tabletopserver-env.nsfmpmmpw3.us-east-2.elasticbeanstalk.com";
let baseURL = "https://main-lm88.c9users.io";

module.exports = {
    sendLfmPost: function(query) {
        let request = JSON.stringify(query);
        let result;
        fetch(baseURL + "/populateLfmPost", {method: "post", body: request, headers: {'Content-Type': 'application/json'}})
        .then(res => res.json())
        .then(json => result = json);
        //.catch(console.error(err.message));
        
        return result;
    },
    
    getFilteredPosts: function(query) {
        let request = JSON.stringify(query);
        fetch(baseURL + "/organizePosts", {method: "post", body: request, headers: {'Content-Type': 'application/json'}})
        .then(res => res.json())
        .then(json => console.log(json));
        //.catch(console.error(err.message));
    }
};
