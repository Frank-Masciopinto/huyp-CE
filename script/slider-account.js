const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
    removeItems: keys => chrome.storage.local.remove(keys),
  };
let api_referral_count = "https://huypbackend.herokuapp.com/shared_count/?"
let referrals_max = 50
let email_R;
let name_R;
progress_bar = document.querySelector(".container__progress")
call_API_SignUp()


async function call_API_SignUp() {
  console.log("**Checking Referral Count, Calling API***")
  
  params = {
    user_token: await LS.getItem("user_token")
  }
  var esc = encodeURIComponent;
  var query_params = Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&');
  let api_URL = api_referral_count + query_params
  fetch(api_URL, {

  // Adding method type
  method: "GET"
})

// Converting to JSON
.then(response => response.json())

.then((json) => {
try {
  console.log(json)
  let percent = ((json.count/referrals_max) * 100)
  progress_bar.setAttribute("style", `width: ${percent}%`)
  document.querySelector(".count").innerHTML += "<b>" + percent.toString() + "%" + "</b>"
  document.querySelector(".container__progress").classList.add("royalblue-bg")
  if (percent >= 50) {
    let first_star = document.querySelector(".first-star")
    first_star.classList.add("fa-bounce")
    first_star.setAttribute("style", "color:gold;")
    setTimeout(() => {
        first_star.classList.remove("fa-bounce")
    }, 2000);
    if (percent >= 75) {
      let second_star = document.querySelector(".second-star")
      second_star.classList.add("fa-bounce")
      second_star.setAttribute("style", "color:gold;")
      setTimeout(() => {
          second_star.classList.remove("fa-bounce")
      }, 2000);
    }
  }

}
catch {
  console.warn(json)
}
})

.catch((err) => console.log(JSON.stringify(err))
)}

async function update_account_info(account_info_div) {
  //Fetch account info
  email_R = await LS.getItem("Registered_Email")
  name_R = await LS.getItem("Registered_Name")
  let email = document.createElement("p")
  email.innerHTML = "Email: " + "<b>" + email_R + "</b>"
  let name = document.createElement("p")
  name.innerHTML = "Name: " + "<b>" + name_R + "</b>"
  name_R != undefined ? account_info_div.appendChild(name) : console.log("Name is undefined")
  account_info_div.appendChild(email)
}

let cancel_subscription_btn = document.querySelector("#unsubscribe")
cancel_subscription_btn.addEventListener("click", async () => {
  if (await LS.getItem("premium_membership") != "ACTIVE") {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../Images/128.png',
      title: `Huyp`,
      message: "There is no active subscription.",
      priority: 1
  })
  }
  chrome.runtime.sendMessage({message: "Open Payment Page"})
})

let account_info_div = document.getElementById("account-information")
update_account_info(account_info_div)

