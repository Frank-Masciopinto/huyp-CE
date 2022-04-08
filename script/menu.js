let close_x = document.querySelector(".close-x")
close_x.addEventListener("mouseover", function() {
    close_x.classList.add("color-royalblue")
})
close_x.addEventListener("mouseout", function() {
    close_x.classList.remove("color-royalblue")
})
close_x.addEventListener("click", function() {
    chrome.runtime.sendMessage({message: "Close_IFrame"}, function(resp) {console.log(resp)})
})
    

let search_menu_link = document.getElementsByClassName("Search-Button")[0]
search_menu_link.addEventListener("click", function() {
    if (window.location.pathname == "/html/slider-search.html") {}
    else {
        window.location = chrome.runtime.getURL("html/slider-search.html")
    }
})

let saved_menu_link = document.getElementsByClassName("link-two")[0]
saved_menu_link.addEventListener("click", function() {
    if (window.location.pathname == "/html/slider-saved.html") {}
    else {
        window.location = chrome.runtime.getURL("html/slider-saved.html")
    }
})



let account_menu_link = document.getElementsByClassName("Account-Button")[0]
account_menu_link.addEventListener("click", function() {
    if (window.location.pathname == "/html/slider-account.html") {}
    else {
        window.location = chrome.runtime.getURL("html/slider-account.html")
    }
})
