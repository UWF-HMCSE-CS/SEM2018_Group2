/* 
 * General functions for the website
 * 
 * 
 */
 
// TODO add onLoad function for displaying form error messages
// with hbs: {{#if error}} then go to the correct overlay
// and display {{error.message}}

// turn on or off the pop-up overlays
function overlayOn(elem) {
    document.getElementById(elem).style.display = "block";
}
function overlayOff(elem) {
    document.getElementById(elem).style.display = "none";
}

// TODO verify passwords match
