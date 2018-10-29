let lfmPosts = [
    {
        "gameType": "DnD",
        "miles": 50,
        "description": "We're looking for a humble and friendly DM whose up for games on weekends in or around the Fort Walton Beach area.",
        "date": "10/11/2018"
    },
    {
        "gameType": "Pathfinder",
        "miles": 25,
        "description": "18+ hardcore RP only.",
        "date": "10/20/2018"
    }
];

// Returns variable lfmPosts. To call in app.js use "postsService.getLfmPostsData;"
exports.getLfmPostsData = function(query){
    return lfmPosts;
};
