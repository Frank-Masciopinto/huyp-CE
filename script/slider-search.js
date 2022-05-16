console.log("Slide In Injected")
let all_products_fetched;
const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
    removeItems: keys => chrome.storage.local.remove(keys),
  };

let registered_name;

function check_NaN(val) {
    if (parseInt(val) != parseInt(val)) {
      return 0;
    }
    return val;
 }

chrome.runtime.sendMessage({message: "Fetch_similar_products_for_display"}, async function(response) {
    console.log(response)
    if (response.error == true) {
        console.log("Error = true")
        console.log(response.all_products_fetched)

        all_products_fetched = response.all_products_fetched
        document.querySelector("#display-products").setAttribute("style", "filter: blur(7px)")
        display_products(response.all_products_fetched)
        document.querySelector("body").setAttribute("style", "position: relative")
        let error_message_div = document.createElement("div")
        error_message_div.className = "error-message"
        error_message_div.innerText = "Your Free Trial Has Expired"
        let error_button = document.createElement("button")
        error_button.className = "error_button"
        error_button.innerText = "PAY"
        error_button.onclick = function(){ chrome.runtime.sendMessage({message: "Open Payment Page"})}
        error_message_div.prepend(error_button)
        document.querySelector("body").prepend(error_message_div)
    }
    else {
        try {
            all_products_fetched = response.all_products_fetched.results
            display_products(response.all_products_fetched.results)
        }
        catch {
            console.log("Catch, undefined products_fetched, await for localstorage...")
            all_products_fetched = await LS.getItem("prev_search_results")
            console.log(all_products_fetched)
            display_products(all_products_fetched.results)
        }
    }
})
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].img == obj.img) {
            return true;
        }
    }

    return false;
}

async function display_one_product(product_obj, array_index, all_favorites_products) {
    return new Promise((res, rej) => {
        let container_single_product = document.createElement("div")
        container_single_product.className += "flex-space-evenly"
        container_single_product.id = "single-product"
        //Create Image
        let product_image = document.createElement("img")
        product_image.className += "product-image"
        product_image.src = product_obj.img
        //Create Product Details
        let product_details = document.createElement("div")
        product_details.id = "product-details"
        let brand = document.createElement("p")
        brand.id = "brand"
        brand.innerText = product_obj.brand
        let title = document.createElement("p")
        title.id = "title"
        title.innerText = product_obj.description
        let price = document.createElement("p")
        price.id = "price"
        price.innerText = product_obj.price_str
        //container buttons
        let container_buttons = document.createElement("div")
        container_buttons.className += "align-center"
        container_buttons.id = "container-buttons"
        //favorite icon
        let favorite_btn = document.createElement("i")
        favorite_btn.className = "fa-solid margins heart-margin fa-heart fa-xl"
        favorite_btn.setAttribute("index", array_index)
        console.log("***All FAVORITES***")
        console.log(all_favorites_products)
        if (containsObject(product_obj, all_favorites_products)) {
            console.log("Inside make red fav")
            favorite_btn.setAttribute("style", "color:red;")
        }
        //Sharing Icon
        let twitter_btn = document.createElement("i")
        twitter_btn.className = "fa-brands margins fa-twitter-square fa-xl"
        twitter_btn.setAttribute("index", array_index)
        // let facebook_btn = document.createElement("i")
        // facebook_btn.className = "fa-brands margins fa-facebook-square fa-xl"
        // facebook_btn.setAttribute("index", array_index)
        let whatsapp_btn = document.createElement("i")
        whatsapp_btn.className = "fa-brands margins fa-whatsapp-square fa-xl"
        whatsapp_btn.setAttribute("index", array_index)
        let sms_btn = document.createElement("i")
        sms_btn.className = "fa-solid margins fa-comment-sms fa-xl"
        sms_btn.setAttribute("index", array_index)
        //view button
        let view_button = document.createElement("button")
        view_button.onclick = function(){chrome.tabs.create({ url: product_obj.link });};
        view_button.setAttribute("link", product_obj.link)
        view_button.id = "visit-page"
        view_button.innerText = "View Product"
        //Whatsapp Share Number input
        let whatsapp_phone_number = document.createElement("input")
        whatsapp_phone_number.type = "text"
        whatsapp_phone_number.id = "whatsapp-number"
        whatsapp_phone_number.name = "name"
        whatsapp_phone_number.placeholder = "+x (xxx) xxx-xxx."
        whatsapp_phone_number.setAttribute('msg-text', `Check out ${product_obj.description} from ${product_obj.brand} for ${product_obj.price_str} on desktop HUYP extension: ${product_obj.link}`)
        //Share btn whatsapp
        let share_whatsapp_button = document.createElement("button")
        share_whatsapp_button.id = "whatsapp-share-btn"
        share_whatsapp_button.innerText = "Share Now"
        share_whatsapp_button.setAttribute("index", array_index)
        //Append all new elements
        //container_buttons.appendChild(facebook_btn)
        container_buttons.appendChild(whatsapp_btn)
        container_buttons.appendChild(sms_btn)
        container_buttons.appendChild(twitter_btn)
        //container_buttons.appendChild(favorite_btn)
        container_buttons.appendChild(view_button)
        //Append all info to product details div
        product_details.appendChild(brand)
        product_details.appendChild(title)
        product_details.appendChild(price)
        product_details.appendChild(container_buttons)
        product_details.appendChild(whatsapp_phone_number)
        product_details.appendChild(share_whatsapp_button)
        container_single_product.appendChild(product_image)
        container_single_product.appendChild(favorite_btn)
        container_single_product.appendChild(product_details)
        document.querySelector("#display-products").appendChild(container_single_product)
        res()
    })
}

async function display_products(all_products_array) {
    let all_favorites_products = await LS.getItem("all_favorites")
    for (let i=0; i<all_products_array.length; i++) {
        await display_one_product(all_products_array[i], i, all_favorites_products)
    }
    document.querySelector("#single-product").id = "first-product"

    let favorites = document.querySelectorAll(".fa-heart")
    for (let i=0; i<favorites.length; i++) {
        favorites[i].addEventListener("click", async () => {
            let arr_index = favorites[i].getAttribute("index")
            let product = all_products_fetched[arr_index]
            favorites[i].classList.add("fa-beat")
            favorites[i].setAttribute("style", "color:red; --fa-animation-duration: 0.5s;")
            setTimeout(() => {
                favorites[i].classList.remove("fa-beat")
                favorites[i].style.removeProperty('--fa-animation-duration')
            }, 500);
            let all_fav = await LS.getItem("all_favorites")
            all_fav.push(product)
            await LS.setItem("all_favorites", all_fav)
            chrome.runtime.sendMessage({message: "Add_Favorite", product_to_save: product})
        })
    }
    let twitter_share_btns = document.querySelectorAll(".fa-twitter-square")
    for (let i=0; i<twitter_share_btns.length; i++) {
        twitter_share_btns[i].addEventListener("click", async () => {
            let arr_index = twitter_share_btns[i].getAttribute("index")
            let product = all_products_fetched[arr_index]
            twitter_share_btns[i].classList.add("fa-bounce")
            twitter_share_btns[i].setAttribute("style", "color:royalblue;")
            setTimeout(() => {
                twitter_share_btns[i].classList.remove("fa-bounce")
            }, 2000);
            params = {
                url: product.link,
                text: `Just found the best of the best deals thanks to Huyp`
            }
            let url = "https://twitter.com/intent/tweet?url=" + params.url + "&text=" + params.text
            url.replace("/url?url=", "")
            add_to_share_count("Twitter-Share")
            window.open(url)
        })
    }
    
    // let facebook_share_btns = document.querySelectorAll(".fa-facebook-square")
    // for (let i=0; i<facebook_share_btns.length; i++) {
    //     facebook_share_btns[i].addEventListener("click", async () => {
    //         let arr_index = facebook_share_btns[i].getAttribute("index")
    //         let product = all_products_fetched[arr_index]
    //         facebook_share_btns[i].classList.add("fa-bounce")
    //         facebook_share_btns[i].setAttribute("style", "color:royalblue;")
    //         setTimeout(() => {
    //             facebook_share_btns[i].classList.remove("fa-bounce")
    //         }, 2000);
    //         let url = "https://www.facebook.com/sharer/sharer.php?u=" + product.link
    //         add_to_share_count("Facebook-Share")
    //         window.open(url)
    //     })
    // }
    let sms_share_btns = document.querySelectorAll(".fa-comment-sms")
    for (let i=0; i<sms_share_btns.length; i++) {
        sms_share_btns[i].addEventListener("click", async () => {
            let arr_index = sms_share_btns[i].getAttribute("index")
            let product = all_products_fetched[arr_index]
            sms_share_btns[i].classList.add("fa-bounce")
            sms_share_btns[i].setAttribute("style", "color:royalblue;")
            setTimeout(() => {
                sms_share_btns[i].classList.remove("fa-bounce")
            }, 2000);
            let = sms_text = "Hi%20there!%20I%20found%20a%20great%20deal%20using%20HUYP%2C%20have%20a%20look%20--%3E%20" + product.link
            let url = "sms:%20&body=" + sms_text

            add_to_share_count("SMS-Share")
            window.open(url)
        })
    }
    let whatsapp_share_btns = document.querySelectorAll(".fa-whatsapp-square")
    for (let i=0; i<whatsapp_share_btns.length; i++) {
        whatsapp_share_btns[i].addEventListener("click", async () => {
            let arr_index = whatsapp_share_btns[i].getAttribute("index")
            let product = all_products_fetched[arr_index]
            whatsapp_share_btns[i].classList.add("fa-bounce")
            whatsapp_share_btns[i].setAttribute("style", "color:royalblue;")
            setTimeout(() => {
                whatsapp_share_btns[i].classList.remove("fa-bounce")
            }, 2000);
            let whatsapp_phone_number = document.querySelectorAll("#whatsapp-number")[i]
            let whatsapp_message = whatsapp_phone_number.getAttribute('msg-text');
            window.open(`https://api.whatsapp.com/send/?&text=${whatsapp_message}`, '_blank')
            add_to_share_count("Whatsapp-Share")

        })
    }

}

async function add_to_share_count(method) {
    var url = "https://huypbackend.herokuapp.com/shared/?";

    console.log("**Adding Share Count, Calling API***")
    console.log(method)
    params = {
        user_token: await LS.getItem("user_token"),
        contact: method
    }
    var esc = encodeURIComponent;
    var query_params = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
    let api_URL = url + query_params
    fetch(api_URL, {

    // Adding method type
    method: "GET"
    })

    // Converting to JSON
    .then(response => response.json())

    .then((json) => {
        console.log(json)
        })
        
}