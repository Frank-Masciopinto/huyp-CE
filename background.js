const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
    removeItems: keys => chrome.storage.local.remove(keys),
  };
let  api_trialTime_is_expired = "http://143.198.149.10:8080/trial_countdown/?"
let free_trial_no_days = 2
importScripts('ExtPay.js')
var extpay = ExtPay('cjieiphfkblcbamafhefbjmelahlmfel'); 
let error_message = undefined
let injected_tab_id;
let products_fetched;
let api_image_URL = "https://huypbackend.herokuapp.com/similar_items/"
let api_add_favorites = "https://huypbackend.herokuapp.com/favorites_add/?"
let api_delete_favorites = "https://huypbackend.herokuapp.com/favorites_delete/?"
let api_SignUp = "https://huypbackend.herokuapp.com/user_register/?"
let error_fake_items = [
    {
        "brand": "otrium.it",
        "description": "Liliya Blouse White Black",
        "img": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQnhjVOONMOa3xATp8pvrPfR5Y4Y5GCwAVJX4hoaerdUDgPEVwE4MMZMFI93SFUvBY7R-a8kLYF6b8FgS_y3OpOVuocS-8u8s24X7Xhys_w1iwWRz4tUjyt&usqp=CAE",
        "link": "https://www.otrium.it/product/liliya-blouse-white-black&rct=j&q=&esrc=s&sa=U&ved=0ahUKEwjYssrvrdL3AhWuK0QIHSXND-0Q2SkIrww&usg=AOvVaw3Xt948E8SuK-2xrTWa0KSM",
        "price": 34.99,
        "price_str": "34,99 €"
    },
    {
        "brand": "Zalando.it",
        "description": "Illusive London Core Grandad Shirt - Black",
        "img": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRErjspm4dbHYLz-mXG2gcoibEdi5-LkY2J7RYlJ3b-xjdl2afVPQ4E7mrGwZugasPMDRSQdhb01EWhQgGpXVmOUF67R0TrP5L8gMx2crlid2wMP7LfNSsC&usqp=CAE",
        "link": "https://www.google.com/shopping/product/9320232559110409635",
        "price": 22.48,
        "price_str": "22,48 €"
    },
    {
        "brand": "PUMA.com",
        "description": "Puma Power Half Placket Felpa black, Donna, Taglia: XS, Nero",
        "img": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRjzAN5iDkin4S6iIvZqZ846LlYUzisu-ZFJp_0YI1lWlxjrTmGQfVqaXBmVcenLiWCtn22gGH-zST4MNKB46EweVrkbIviT2eVnf80gHUVZaFjJIudgAmD&usqp=CAE",
        "link": "https://www.google.com/shopping/product/2201870245669166361",
        "price": 34.95,
        "price_str": "34,95 €"
    },
    {
        "brand": "aboutyou.it",
        "description": "Classic Checked Shirt Black/Red - Urban Classics TB4699 - Taglia 5XL",
        "img": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS0Bgc6UWRXNffuKN1QRt95vV2OutReorP4j2efe3mS01idwUnCHHu0mrZc-WRnJbvffXncRl7iUkwoSJgTqmPL4Kuk93iE&usqp=CAE",
        "link": "https://www.google.com/shopping/product/10517099169210977054",
        "price": 49.9,
        "price_str": "49,90 €"
    },
    {
        "brand": "fruugo.it",
        "description": "Gaoguang Cintura a righe da Uomo Placket Cerniera Decorazione Personalità piccola Tasca per I piedi Pantaloni Casual Nero M",
        "img": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSQEwUu899V1d8Nhbyv8qplbpVIkPRftVjVkWIqdo5mKYYfEhVR9T9i0PuYculcGiTjOJe79kPQG6u1P_oJovM9GUWhNCUKRdAT5w3le7zWeM7p2_Iv2CrShA&usqp=CAE",
        "link": "https://www.google.com/shopping/product/17549561377711849775",
        "price": 41.95,
        "price_str": "41,95 €"
    },
    {
        "brand": "Tablas Surf Shop",
        "description": "Lihue Eco SS Shirt Black by Vissla",
        "img": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRdlg1_igQKTVGLZAy3SdDrH4waErEQ8CVRQjVDDP6NnMsyLAwu6YWzfcZFoFggRQYT6c90DCBezOoZk0RAwxpUcg0qOlVIjZOrmDxSY-1n&usqp=CAE",
        "link": "https://www.google.com/shopping/product/15772077042876518626",
        "price": 41.35,
        "price_str": "41,35 €"
    },
    {
        "brand": "otrium.it",
        "description": "Skirt FRONT Placket",
        "img": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSoncj2mQYbJXDS7KvOGoBc7BGjUK3-v-ofEfx7hl0vKqJlatpkpLA3cz2AJWDcqouPXp8xx7pyjkyemZ0bEXV6Cq0CJJFQtMbj0CEO4-GGtgfRSSksoWlq&usqp=CAE",
        "link": "https://www.google.com/shopping/product/16640369745882604230",
        "price": 47.99,
        "price_str": "47,99 €"
    },
    {
        "brand": "eBay.it",
        "description": "kywommnz Women Long Sleeve Round Neck Shirt, Shirt with Pocket and Placket,",
        "img": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSyjgXfRxk8MBEGjXtzez0zleYEFqO6U_5QmuzbRiG9hPrJs4cYOLsD6pvE9gnRjiF9pJZxV78KMB3UTofIEA1DDn6g3EoOYKC7-rbFI63R&usqp=CAE",
        "link": "https://www.google.com/shopping/product/15196648689532661562",
        "price": 89.05,
        "price_str": "89,05 €"
    },
    {
        "brand": "Zalando.it",
        "description": "Jack & Jones Camicia Manica lunga Black Summer Half Placket M",
        "img": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR45YMmyHiKEZ2pSCgT8IB-x62MUvGGALc-H3f-SRBtiwrb8gGnPwVicd1hofoagTYc0xt17qcJGJMmXlJvZ9MEXkldSi_DELjBqeC6wBicX8wEPWPra-wHPg&usqp=CAE",
        "link": "https://www.google.com/shopping/product/15336625572062692740",
        "price": 39.99,
        "price_str": "39,99 €"
    },
    {
        "brand": "Grandado ITA",
        "description": "EWQ/uomini 'usura astinenza nessun tasto nero nicchia disegno della maglia nera per il maschio ins all-partita scialle stile gilet per il maschio ",
        "img": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT9S3Vbw6aHtOJT1nffNEVcvS8fRgBW1RquhI0cJdbKiMpHEH1lVRsjHdmjgrl8GDc2PVmtkGQGu0DWE7PaJ41AL85w97pgVsAfGHxOd__7ZRTkDL0X3Dqr&usqp=CAE",
        "link": "https://ita.grandado.com/products/ewq-uomini-usura-astinenza-nessun-tasto-nero-nicchia-disegno-della-maglia-nera-per-il-maschio-ins-all-partita-scialle-stile-gilet-per-il-maschio-9y3233%3Fvariant%3DUHJvZHVjdFZhcmlhbnQ6Mjg4NTg1MjA&rct=j&q=&esrc=s&sa=U&ved=0ahUKEwjYssrvrdL3AhWuK0QIHSXND-0Q2SkInw4&usg=AOvVaw17nH7sliQQLvDrIDNXDSca",
        "price": 40.89,
        "price_str": "40,89 €"
    },
    {
        "brand": "OnlineGolf IT",
        "description": "Polo Greg Norman moonbeam, maschile, black, Medium Online Golf",
        "img": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcReAkS6wBtkwlbXi_FLO335ukecCliBnyfjdMeLZI16YzHc8jWtSAt50yTJPaHJuVpWwDD8prOx2Ti8vCfVvinRQnKx5fsKhsiZj0g1jdmqkuR4CX6lRoysJg&usqp=CAE",
        "link": "https://www.google.com/shopping/product/11466833012977266313",
        "price": 22.95,
        "price_str": "22,95 €"
    },
    {
        "brand": "COS",
        "description": "COS Men's Regular-Fit Hemp Shirt - Black - Camicia",
        "img": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTcrEPSTkfOap-JmG5ydyOus-Ce44Zrq4NFlx-qvcjOZVPFajcO_y7G_MYD6WutkB_ICn_vMxLq5btEDI6OCdnrOwVlOVdrsKf20OPKO8-6M90C4-CHyNRI&usqp=CAE",
        "link": "https://www.google.com/aclk?sa=l&ai=DChcSEwjTsc_vrdL3AhUtHq0GHTi2Do0YABAvGgJwdg&sig=AOD64_0fBF8ThaPmK1yCyyBoWv_R83hAJw&ctype=5&q=&ved=0ahUKEwjYssrvrdL3AhWuK0QIHSXND-0Q9A4I1xE&adurl=",
        "price": 59,
        "price_str": "59,00 €"
    },
    {
        "brand": "EMP-Online.it",
        "description": "Black Premium by EMP Grey T-shirt with wash, Print and Button Placket T-shirt Grigio male M",
        "img": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQp675MDCoNCdB1XeqLpVmQxsXuZhRWz3BvgKva8g91cNtTzrUFoJKUHwcIx3aGqsLl8-fP8TeJskGiDXafcEJPUUwDYAXeEbn1I-yK4q3yd1QAjA_MKuVt&usqp=CAE",
        "link": "https://www.google.com/shopping/product/9275727619560964590",
        "price": 23.99,
        "price_str": "23,99 €"
    },
    {
        "brand": "Wordans.it",
        "description": "Basic College Jacket Black/White - Build Your Brand BB004 - Taglia XS",
        "img": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQge2YNDSSJ8moJ21dnmdi0n9pBYYgXt-q6qHx9-bDssBiTj0GSkrxtN6-0s17CMX7J9ZamodtMjvjXRq5t7i7ITnd3yhrjJ4lEG_p6b4LDZOaiu6uLvWJp&usqp=CAE",
        "link": "https://www.google.com/shopping/product/8772677749093481441",
        "price": 25.08,
        "price_str": "25,08 €"
    },
    {
        "brand": "COS",
        "description": "COS Men's Relaxed-Fit Knitted Polo Shirt - Black - Camicia",
        "img": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSRYleQThq4d-AEJYjDo6Gc9Yn0aXOXlu4B1SQAEvCSR1ChoQLkp7HplRg3JepGaVwqFp1-T4oua2zNmkrP9IQrwKav_FFinrnIWk18PUviVAfLIkSowrJnfg&usqp=CAE",
        "link": "https://www.google.com/aclk?sa=l&ai=DChcSEwjTsc_vrdL3AhUtHq0GHTi2Do0YABA3GgJwdg&sig=AOD64_0dp87xB6raFKlWDUOzNJGfEYiv3Q&ctype=5&q=&ved=0ahUKEwjYssrvrdL3AhWuK0QIHSXND-0Q9A4I5BE&adurl=",
        "price": 59,
        "price_str": "59,00 €"
    },
    {
        "brand": "Zalando.it",
        "description": "Marc O'Polo Short Sleeve Button Placket Polo Dark navy, Uomo, Taglia: XS, Blu scuro",
        "img": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR4XPwmkB1PNliDDpRUWszvbtGcqeiZCFMcJjNjpAX26oXr8tQhM3wEYlggh4LjTKfAugEMY7TN8LNrSBBet1hxV1m_0jYogaBaft-yBIF4IspMBE8u9N68&usqp=CAE",
        "link": "https://www.google.com/shopping/product/9667038961219185685",
        "price": 48.99,
        "price_str": "48,99 €"
    },
    {
        "brand": "Zalando.it",
        "description": "Calvin Klein Color Blocking Logo Placket Polo Colorblock black/white, Uomo, Taglia: XS, Nero",
        "img": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSpRGbYq4evC06P_2nSl60sISP3PRgWjll0jxotMcmNjcUUa3c7kSHWIeM5XB9gdvhqw6lXKTsxy2kRMt4tZLxBNMhJFnfUzrNsLVHAI3N9AIJY7ar6nzgI&usqp=CAE",
        "link": "https://www.google.com/shopping/product/14977899306206440765",
        "price": 80.99,
        "price_str": "80,99 €"
    },
    {
        "brand": "Abercrombie & Fitch",
        "description": "Rugby Polo da Uomo in Black | Taille M | Abercrombie & Fitch",
        "img": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRSniPa8i_IrNBMzoif4cZkyV-onLBdettgT6udNO8atgXZ7oR08BEh2QaoUGpzO242Wy5mIOXwWSIc0QeYDLpVP_PsqiHXcsk6_5OJukjodip2IbzTwZ2ROg&usqp=CAE",
        "link": "https://www.google.com/shopping/product/6846599318021183365",
        "price": 42,
        "price_str": "42,00 €"
    },
    {
        "brand": "COS",
        "description": "COS Women's Oversized Collar Long-Sleeve Shirt - Black - Camicia",
        "img": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSm5fFOFE5Cr5Hmm5fCLgvxBg_tGapZEV47BT4W9Mqp3XJiTETE5pYTUfKpZN2NoHPc6EHbaIfX69kdLqKhmggUMB9hhQ3XIRxY1oVanCUUGhG8mPz-4DLD8Q&usqp=CAE",
        "link": "https://www.google.com/aclk?sa=l&ai=DChcSEwjTsc_vrdL3AhUtHq0GHTi2Do0YABApGgJwdg&sig=AOD64_36mRQJK1UkNRtc-1Zv37OtlQcx2g&ctype=5&q=&ved=0ahUKEwjYssrvrdL3AhWuK0QIHSXND-0Q9A4IzhE&adurl=",
        "price": 79,
        "price_str": "79,00 €"
    },
    {
        "brand": "Talia Collective",
        "description": "Cap Ferret Shirt in Black",
        "img": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSSguHyRMP-H0OSJqXpWAYvkZyhIWto1EcH6zjF9_63tU3RSR7CHHQdHuZKgj_zYWsJzgP62KGivryiyPcwrwdc68FROfhOKRBFRvt6Brtun6jErP5MXGqV&usqp=CAE",
        "link": "https://www.google.com/shopping/product/9187504291367274881",
        "price": 89,
        "price_str": "89,00 €"
    }
]

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
    await LS.setItem("is_injected_capture_screen", false)
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
        var extpay = ExtPay('cjieiphfkblcbamafhefbjmelahlmfel'); 
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
        else if (error_message != undefined) {
            console.log("Error Fake Items - Sending")
            sendResponse({error: true, all_products_fetched: error_fake_items})
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
        await check_free_trial_expiration_date()
        if (await LS.getItem("user_token") != undefined && await LS.getItem("is_injected_capture_screen") == false) { //If already Signed Up
            if (await LS.getItem("free_membership") == "ACTIVE" || await LS.getItem("premium_membership") == "ACTIVE") { // CHECK IF MEMBERSHIP IS ACTIVE
                await LS.setItem("captured_Tab", tab.id)
                await LS.setItem("is_injected_capture_screen", true)
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
        else if (await LS.getItem("is_injected_capture_screen") == true) {
            console.log("Removing Product Focus...")
            await LS.setItem("is_injected_capture_screen", false)
            chrome.scripting.removeCSS({
                target: {tabId: tab.id},
                files: ['./script/inject.js']   
            })
            chrome.runtime.reload()
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
    return new Promise(async (res, rej) => {
        console.log("**Checking expdate, Calling API***")
        let user_token = await LS.getItem("user_token")
        console.log(user_token)
        params = {
            user_token: user_token
        }
        var esc = encodeURIComponent;
        var query_params = Object.keys(params)
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');
        let api_URL = api_trialTime_is_expired + query_params
        console.log(api_URL)
        fetch(api_URL, {
    
        // Adding method type
        method: "GET"
    })
    
    // Converting to JSON
    .then((response) => {
        console.log("Response if FREE Member below")
        console.log(response)
        return response.json()
    } )
    
    .then(async (json) => {
        console.log(json)
        if (json.free_trial_available == true) {
            await LS.setItem("free_membership", "INACTIVE")
            chrome.notifications.create({
                type: 'basic',
                iconUrl: '../Images/128.png',
                title: `Huyp - Your Free Trial Has Expired`,
                message: "Please purchase our yearly plan to keep using Huyp",
                priority: 1
            })
            chrome.tabs.query({active : true, lastFocusedWindow : true}, function (tabs) {
                console.log("SENDIN ERROR MESSAGE - OPEN SLIDER")
                var CurrTab = tabs[0];
                error_message = true
                chrome.tabs.sendMessage(CurrTab.id, {message: "open_side_panel"}, (response) => {})
            })
            res()
        }
        else {
            console.log(json)
            res()
        }
    })
    
    .catch(function (err) {
        console.log("Server response error, for free trial... <---")
        //document.getElementById("error-login").innerText = JSON.stringify(err)
        res()
    })
    })
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
        await LS.setItem("is_injected_capture_screen", false)
        await LS.setItem("premium_membership", "INACTIVE")
        await LS.setItem("free_member_since", today.toString())
        await LS.setItem("error_fake_items", error_fake_items)
}});
//check_free_trial_expiration_date()