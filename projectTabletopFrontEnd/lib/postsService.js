let lfmPosts = [
    {
        "postID": 1,
        "gameType": "DnD",
        "miles": 50,
        "description": "We're looking for a humble and friendly DM whose up for games on weekends in or around the Fort Walton Beach area.",
        "date": "10/11/2018"
    },
    {
        "postID": 2,
        "gameType": "Pathfinder",
        "miles": 25,
        "description": "18+ hardcore RP only.",
        "date": "10/20/2018"
    },
    {
        "postID": 3,
        "gameType": "CoC",
        "miles": 10,
        "description": "Hello my name is Junior. Generally I play righteous characters but am okay with mixing it up.",
        "date": "11/12/2018"
    },
    {
        "postID": 4,
        "gameType": "GURPS",
        "miles": 50,
        "description": "I only play paladins.",
        "date": "10/01/2018"
    },
    {
        "postID": 5,
        "gameType": "DnD",
        "miles": 50,
        "description": "Priest looking for an adventuring group. Short games or long it doesn't matter.",
        "date": "09/20/2018"
    }
];

// Returns variable lfmPosts. To call in app.js use "postsService.getLfmPostsData;"
exports.getLfmPostsData = function(query){
    return lfmPosts;
};
