const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
    removeItems: keys => chrome.storage.local.remove(keys),
  };

let free_trial_no_days = 14
importScripts('ExtPay.js')
var extpay = ExtPay('hochhhgdlncmknchdngodkccneibpopn'); 

let injected_tab_id;
let products_fetched;
let api_image_URL = "https://huypbackend.herokuapp.com/similar_items/"
let api_add_favorites = "https://huypbackend.herokuapp.com/favorites_add/?"
let api_delete_favorites = "https://huypbackend.herokuapp.com/favorites_delete/?"
let api_SignUp = "https://huypbackend.herokuapp.com/user_register/?"
// chrome.tabs.onActivated.addListener(tab => {
//     //Check if Linkedin is in the url
//     chrome.tabs.get(tab.tabId, function(tab) {
//         if(chrome.runtime.lastError) {
//             console.log("Inside runtime error")
//         }
//         else {
//             try {
//                 inject_Js(tab.url, tab.tabId)
//             }
//             catch {
//             console.log("Inside tab is  undefined")
//             }
//         }
//     })
//     function inject_Js(link, tabId){
//         if (link.includes("chrome://") || link.includes("developer.chrome.com") || link.includes("chrome-extension://") || link.includes("chrome-error://") || link.includes("chrome.google.com/webstore") || link.includes("about:") || link.includes("addons.mozilla.org") || link.includes("moz-extension://")){
//             console.log("Inside google chrome")
//         }
//         else {
//             check_than_Insert_JS("content.js", "google.css", tabId)
//         }
//     }});

// //On Every new tab Update
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

//     var existCondition = setInterval(function() {
//         //console.log("CHECK HERE: ", changeInfo)
//         if (changeInfo.status == "complete") {
//            console.log("DOM Loaded!");
//            clearInterval(existCondition);
//            inject_javascript();
//         }
//        }, 2000);


//     function inject_javascript(){
//         console.log("Inside On Updated")
//         //Check if Linkedin is in the url
//             chrome.tabs.get(tabId, function(tab) {
//                 if(chrome.runtime.lastError) {
//                     console.log("Inside runtime error")
//                 }
//                 else {
//                     try {
//                         inject_Js(tab.url, tabId)
//                     }
//                     catch {
//                     console.log("Inside tab is  undefined")
//                     }
//                 }
//             })



//         function inject_Js(link, tabId){
//             console.log("Inside Inject js onupdated")

//             if (link.includes("chrome://") || link.includes("chrome-extension://") || link.includes("developer.chrome.com") || link.includes("chrome.google.com/webstore") || link.includes("about:") || link.includes("addons.mozilla.org") || link.includes("moz-extension://")){
//                 console.log("UPDATED Inside google chrome")
//             }
//             else {
//                 check_than_Insert_JS("content.js", "google.css", tabId)
//             }

//     }}});
// function to insert scripts by checking if they are already injected first
function check_than_Insert_JS(js_File_Name, css_File_Name, tabId){

    let content_Message = "are_you_there_content_script?"

    chrome.tabs.sendMessage(tabId, {message: content_Message}, function(msg) {
        msg = msg || {};
        if(chrome.runtime.lastError) {
            console.log("Inside runtime error, NO SCRIPT IS THERE! ------+++++ new function---> " + js_File_Name)
            if (css_File_Name != "NO_FILE")  {
                chrome.scripting.insertCSS({
                    target: {tabId: tabId},
                    files: ["./style/"+css_File_Name]
                  }, () => {
                    const lastError = chrome.runtime.lastError;
                    if (lastError) {
                      return notify(lastError);
                    }
                })}
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ["./script/"+js_File_Name]
            });
        }
        else if(msg.status != 'yes') {
            if (css_File_Name != "NO_FILE")  {
                chrome.scripting.insertCSS({
                    target: {tabId: tabId},
                    files: ["./style/"+css_File_Name]
                  }, () => {
                    const lastError = chrome.runtime.lastError;
                    if (lastError) {
                      return notify(lastError);
                    }
                })}
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ["./script/"+js_File_Name]
            });
        }
        else {console.log("already injected js => " + js_File_Name)}
    });
}

function capture(request) {
    return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, dataUrl => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
            return reject(lastError);
        }

        if (!request) {
            return resolve(dataUrl);
        }

        const left = request.left * request.devicePixelRatio;
        const top = request.top * request.devicePixelRatio;
        const width = request.width * request.devicePixelRatio;
        const height = request.height * request.devicePixelRatio;

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        fetch(dataUrl).then(r => r.blob()).then(async blob => {
            const prefs = await new Promise(resolve => chrome.storage.local.get({
            quality: 0.95
            }, resolve));

            const img = await createImageBitmap(blob);
            if (width && height) {
            ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
            }
            else {
            ctx.drawImage(img, 0, 0);
            }
            canvas.convertToBlob({
            type: 'image/png',
            quality: prefs.quality
            }).then(resolve);
        });
        });
    });
}

function send_image_to_backend(tabId, image_b) {
    console.log("**sending Image to backend***")
    let formData = new FormData();
    formData.append('img', image_b);
    let api_URL = "https://huypbackend.herokuapp.com/similar_items/"
    fetch(api_URL, {

    // Adding method type
    method: "POST",

    // Adding body or contents to send
    body: formData
})

// Converting to JSON
.then(response => response.json())

// Displaying results to console
.then(async function (json) {
    chrome.tabs.sendMessage(tabId, {message: "remove_product_focus"}, (response) => {})
    console.log(tabId)
    chrome.tabs.sendMessage(tabId, {message: "open_side_panel"}, (response) => {})
    console.log(json)
    products_fetched = json
    await LS.setItem("prev_search_results", json)
})
.catch(function (err) { 
    if (err == {}) {
        err = "No similar Product Was Found, Please Try Again."
    }
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'Images/128.png',
        title: `Huyp`,
        message: JSON.stringify(err),
        priority: 1
    })
    chrome.tabs.sendMessage(tabId, {message: "remove_product_focus"}, (response) => {})
})
}

async function call_API_add_favorite(product_obj) {
    console.log("**Adding Favorite to backend***")
    params = {
        user_token: await LS.getItem("user_token"),
        price: product_obj.price,
        price_str: product_obj.price_str,
        link: product_obj.link,
        img: product_obj.img,
        description: product_obj.description,
        brand: product_obj.brand
    }
    var esc = encodeURIComponent;
    var query_params = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
    let api_URL = api_add_favorites + query_params
    fetch(api_URL, {

    // Adding method type
    method: "GET",

})

// Converting to JSON
.then(response => console.log(response))

.catch((err) => 
    // chrome.notifications.create({
    //     type: 'basic',
    //     iconUrl: 'Images/128.png',
    //     title: `Huyp`,
    //     message: err,
    //     priority: 1
    // })
    console.log(err)
)
}

async function call_API_remove_favorite(product_obj) {
    console.log("**Removing Favorite to backend***")
    params = {
        user_token: await LS.getItem("user_token"),
        price: product_obj.price,
        price_str: product_obj.price_str,
        link: product_obj.link,
        img: product_obj.img,
        description: product_obj.description,
        brand: product_obj.brand
    }
    var esc = encodeURIComponent;
    var query_params = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
    let api_URL = api_delete_favorites + query_params
    fetch(api_URL, {

    // Adding method type
    method: "GET",

})

// Converting to JSON
.then(response => console.log(response))

.catch((err) => chrome.notifications.create({
    type: 'basic',
    iconUrl: './Images/128.png',
    title: `Huyp`,
    message: JSON.stringify(err),
    priority: 1
}))
}

function save(blob, tab) {
    chrome.storage.local.get({
        'timestamp': true,
        'saveAs': false,
        'save-disk': false,
        'edit-online': false,
        'send_backend': true,
        'save-clipboard': false
    }, prefs => {
        let filename = tab.title;
        if (prefs.timestamp) {
        const time = new Date();
        filename = filename += ' ' + time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
        }

        const reader = new FileReader();
        reader.onload = async () => {
        // save to clipboard
        if (prefs['save-clipboard']) {
            chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: async href => {
                try {
                const blob = await fetch(href).then(r => r.blob());
                await navigator.clipboard.write([new ClipboardItem({
                    'image/png': blob
                })]);
                }
                catch (e) {
                console.warn(e);
                alert(e.message);
                }
            },
            args: [reader.result]
            });
        }
        //Send to backend
        if (prefs['send_backend']) {
            let tabId = await LS.getItem("captured_Tab")
            send_image_to_backend(tabId, reader.result.replace("data:image/png;base64,", ""))
        }
        // edit online
        if (prefs['edit-online']) {
            setTimeout(() => chrome.tabs.create({
            url: 'https://webbrowsertools.com/jspaint/pwa/build/index.html#load:' + reader.result
            }), 500);
        }
        // // save to disk
        // if (prefs['save-disk'] || (prefs['save-clipboard'] === false && prefs['edit-online'] === false)) {
        //     chrome.downloads.download({
        //     url: reader.result,
        //     filename: filename + '.png',
        //     saveAs: false && prefs.saveAs // saveAs is not supported on v3
        //     }, () => {
        //     const lastError = chrome.runtime.lastError;
        //     if (lastError) {
        //         chrome.downloads.download({
        //         url: reader.result,
        //         filename: filename.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '-') + '.png'
        //         }, () => {
        //         const lastError = chrome.runtime.lastError;
        //         if (lastError) {
        //             chrome.downloads.download({
        //             url: reader.result,
        //             filename: 'image.png'
        //             });
        //         }
        //         });
        //     }
        //     });
        // }
        };
        reader.readAsDataURL(blob);
    });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log(request)
    if (request.method === 'captured') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'Images/128.png',
            title: `Huyp`,
            message: 'Looking for similar products...',
            priority: 1
        })
        capture(request).then(a => save(a, sender.tab)).catch(e => {
        console.warn(e);
        notify(e.message || e);
        sendResponse({mess: "DONE"})
        });
    }
    else if(request.message === "Close_IFrame"){
        chrome.tabs.query({active : true, lastFocusedWindow : true}, function (tabs) {
            var CurrTab = tabs[0];
            chrome.tabs.sendMessage(CurrTab.id, {message: "Close_IFrame"})
        })
        sendResponse({mess: "DONE"})
    }
    else if(request.message === "Open Payment Page"){
        var extpay = ExtPay('hochhhgdlncmknchdngodkccneibpopn'); 
        extpay.openPaymentPage()
        sendResponse({mess: "DONE"})
    }
    else if (request.message === 'Fetch_similar_products_for_display') {
       // let prev_search_results = await LS.getItem("prev_search_results")
        console.log("----**-*-*-Fetch products message received")
        console.log(request)
        if (products_fetched != undefined) {
            console.log("****different than null****")
            console.log(products_fetched)
            sendResponse({all_products_fetched: products_fetched})
        }
        else {
            console.log("Prev_Search_Result: ")
            console.log(await LS.getItem("prev_search_results"))
            sendResponse({all_products_fetched: await LS.getItem("prev_search_results")})
        }
        return true
    }
    else if (request.message === "Add_Favorite") {
        console.log(request)
        call_API_add_favorite(request.product_to_save)
        sendResponse({mess: "DONE"})
    }
    else if (request.message === "Remove_Favorite") {
        console.log(request)
        call_API_remove_favorite(request.product_to_remove)
    }
    else if (request.message === "Sign-Up") {
        console.log(request)
        call_API_SignUp(request.account_details)
    }
})

function call_API_SignUp(account_details) {
    console.log("**Removing Favorite to backend***")
    console.log(product_obj)
    params = {
        email: LS.getItem("user_token"),
        password: product_obj.price_str,
        name: product_obj.link
    }
    var esc = encodeURIComponent;
    var query_params = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
    let api_URL = api_SignUp + query_params
    fetch(api_URL, {

    // Adding method type
    method: "GET",

})

// Converting to JSON
.then(response => JSON.parse(response))

.then(json => {
    console.log(json)
})

.catch((err) => chrome.notifications.create({
    type: 'basic',
    iconUrl: 'Images/128.png',
    title: `Huyp`,
    message: JSON.stringify(err),
    priority: 1
}))
}

let logo_directory = './Images/128.png'

const notify = e => chrome.notifications.create({
    type: 'basic',
    iconUrl: logo_directory,
    title: chrome.runtime.getManifest().name,
    message: e.message || e
    });
//notify("ERROR")
chrome.action.onClicked.addListener(
    async function (tab) {
        if (await LS.getItem("user_token") != undefined) { //If already Signed Up
            if (await LS.getItem("free_membership") == "ACTIVE" || await LS.getItem("premium_membership") == "ACTIVE") { // CHECK IF MEMBERSHIP IS ACTIVE
                await LS.setItem("captured_Tab", tab.id)
                console.log("Injecting CSS & JS")
                injected_tab_id = tab.id
                chrome.scripting.insertCSS({
                    target: {tabId: tab.id},
                    files: ['./style/inject.css']
                }, () => {
                    const lastError = chrome.runtime.lastError;
                    if (lastError) {
                    return notify(lastError);
                    }
                    chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    files: ['./script/inject.js']
                    });
                });
            }
        }
        else { //If not signed up, open popup registration form
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'Images/128.png',
                title: `Huyp - Sign-Up`,
                message: "Please Sign-Up Before Using Huyp Extension",
                priority: 1
            })
            chrome.windows.create({url: chrome.runtime.getURL("html/sign-up.html")});
        }
    }
    )

async function check_free_trial_expiration_date() {
    let free_Member_sinc = await LS.getItem("free_member_since")
    let free_Member_since = new Date(free_Member_sinc)
    let oneDay = 86400000
    let today_Date = new Date()
    console.log("Checking if 14 days have passed")
    let days_Passed_Since_Subscription = Math.round(Math.abs((free_Member_since - today_Date) / oneDay));
    console.log(days_Passed_Since_Subscription)
    if (days_Passed_Since_Subscription > free_trial_no_days) {
        await LS.setItem("free_member_days_left", 0)
        console.log("FREE TRIAL EXPIRED! Checking if subscribed")
        var extpay = ExtPay('hochhhgdlncmknchdngodkccneibpopn'); 
        extpay.getUser().then(async (user) => {
            if (user.paid) {
                await LS.setItem("premium_membership", "ACTIVE")
            } else {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'Images/128.png',
                    title: `Huyp`,
                    message: "Your Free Trial Expired, Go Premium to keep using Huyp",
                    priority: 1
                })
                await LS.setItem("free_membership", "INACTIVE")
                extpay.openPaymentPage();
            }
        })    
    }
    else {
        await LS.setItem("free_member_days_left", free_trial_no_days - days_Passed_Since_Subscription)
    }
}

chrome.runtime.onInstalled.addListener(async (details) => {
    if(details.reason == "install"){
        let today = new Date()
        let sign_up = chrome.runtime.getURL("html/sign-up.html")
        chrome.windows.create({url:sign_up})
        //await LS.setItem("user_token", "TEST") // <---- DELETE THIS FOR PRODUCTION

        console.log("ONINSTALL STORAGE SET UP")
        await LS.setItem("all_favorites", [])
        await LS.setItem("free_membership", "ACTIVE")
        await LS.setItem("free_member_days_left", free_trial_no_days)
        await LS.setItem("premium_membership", "INACTIVE")
        await LS.setItem("free_member_since", today.toString())
}});
check_free_trial_expiration_date()