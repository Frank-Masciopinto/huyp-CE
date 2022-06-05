const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
    removeItems: keys => chrome.storage.local.remove(keys),
  };
let all_fav;

display_products(all_fav)

async function display_one_product(product_obj, array_index) {
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
        //favorite icon
        let favorite_btn = document.createElement("i")
        favorite_btn.className = "fa-solid margins heart-margin fa-heart fa-xl"
        favorite_btn.setAttribute("style", "color:red;")
        favorite_btn.setAttribute("index", array_index)
        let view_button = document.createElement("button")
        view_button.onclick = function(){window.open(product_obj.link)};
        view_button.setAttribute("link", product_obj.link)
        view_button.id = "visit-page"
        view_button.innerText = "View Product"
        //Append all info to product details div
        product_details.appendChild(brand)
        product_details.appendChild(title)
        product_details.appendChild(price)
        //product_details.appendChild(favorite_btn)
        product_details.appendChild(view_button)
        
        container_single_product.appendChild(product_image)
        container_single_product.appendChild(favorite_btn)
        container_single_product.appendChild(product_details)
        document.querySelector("#Saved-Items").appendChild(container_single_product)
        res()
    })
}

async function display_products(all_products_array) {
    all_products_array = await LS.getItem("all_favorites")
    console.log(all_products_array)
    for (let i=0; i<all_products_array.length; i++) {
        await display_one_product(all_products_array[i], i)
    }
    if (document.querySelector("#single-product")) {
        document.querySelector("#single-product").id = "first-product"
    }

    let favorites = document.querySelectorAll(".fa-heart")
    for (let i=0; i<favorites.length; i++) {
        favorites[i].addEventListener("click", async () => {
            let arr_index = favorites[i].getAttribute("index")
            let product = all_products_array[arr_index]
            favorites[i].classList.add("fa-fade")
            favorites[i].setAttribute("style", "color:null;")
            setTimeout(() => {
                favorites[i].classList.remove("fa-fade")
            }, 1300);
            let product_container_to_delete = favorites[i]
            all_products_array.splice(arr_index, 1)
            await LS.setItem("all_favorites", all_products_array)
            setTimeout(() => {
                product_container_to_delete.parentElement.style.display = "none"
            }, 1000);
            console.log(product)
            chrome.runtime.sendMessage({message: "Remove_Favorite", product_to_remove: product})
        })
    }
}