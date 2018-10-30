/* 
 * V 0.2
 * 
 * Code based on snippet from
 * https://www.w3schools.com/howto/howto_custom_select.asp
 * modified for clarity and conformity
 * 
 * This script replaces a <select> tag with a <div> of the currently selected item.
 * The original <select> is hidden in css
 * Different styles can now be applied to the drop menu, and each list of items
 */


/* look for any elements with the class "select-div" */
let selectList = document.getElementsByClassName("select-div");

/* for each <div>, do all the things */
for (let i = 0; i < selectList.length; i++) {
    /* find the <select> element and hide it*/
    let selectElement = selectList[i].getElementsByTagName("select")[0];
    selectElement.setAttribute("class", "hide-element");

    /* create a new <div> that will act as this <select> element */
    let currentSelection = document.createElement("DIV");
    currentSelection.setAttribute("class", "select-current");
    currentSelection.innerHTML = selectElement.options[selectElement.selectedIndex].innerHTML;
    selectList[i].appendChild(currentSelection);

    /* create a new <div> that will contain the option list */
    let optionList = document.createElement("DIV");
    optionList.setAttribute("class", "option-list hide-element");
    
    /* for each <option>, create a new <div> that will act as this <option> element */
    for (let j = 0; j < selectElement.length; j++) {
        let optionItem = document.createElement("DIV");
        optionItem.innerHTML = selectElement.options[j].innerHTML;
        
        /* when an item is clicked, update the original select box and the selected item */
        optionItem.addEventListener("click", function(e) {
            /* copy the clicked item (this) to the <select>'s replacement <div> */
            currentSelection.innerHTML = this.innerHTML;
            /* search through each option to find the clicked item (this) */
            for (let k = 0; k < selectElement.length; k++) {
                if (selectElement.options[k].innerHTML == this.innerHTML) {
                    /* set the clicked index to the actual <select> field */
                    selectElement.selectedIndex = k;
                    break;
                }
            }
            /* remove the tags from the previous option add to the clicked item (this) */
            for (let option of optionList.getElementsByClassName("option-current")) {
                option.removeAttribute("class");
            }
            this.setAttribute("class", "option-current");
            currentSelection.click();
        });
        optionList.appendChild(optionItem);
    }
    selectList[i].appendChild(optionList);
    
    /* when clicked, close any other select boxes, and open/close the current select box */
    currentSelection.addEventListener("click", function(e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("hide-element");
        this.classList.toggle("active");
    });
}

/* close all select boxes in the document, except the current select box */
function closeAllSelect(elmnt) {
    var x, y, arrNo = [];
    x = document.getElementsByClassName("option-list");
    y = document.getElementsByClassName("select-current");
    for (let i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i);
        }
        else {
            y[i].classList.remove("active");
        }
    }
    for (let i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("hide-element");
        }
    }
}

/* if the user clicks anywhere outside the select box, then close all select boxes */
document.addEventListener("click", closeAllSelect);