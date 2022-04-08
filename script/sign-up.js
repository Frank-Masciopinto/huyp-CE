console.log("IM HERE")
let api_SignUp = "https://huypbackend.herokuapp.com/user_register/?"
let api_LogIn = "https://huypbackend.herokuapp.com/login/?"

const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({[key]: val}),
    removeItems: keys => chrome.storage.local.remove(keys),
  };

document.querySelector(".log-in").addEventListener("click", function(){
	document.querySelector(".signIn").classList.add("active-dx");
	document.querySelector(".signUp").classList.add("inactive-sx");
	document.querySelector(".signUp").classList.remove("active-sx");
	document.querySelector(".signIn").classList.remove("inactive-dx");
});

document.querySelector(".back").addEventListener("click", function(){
	document.querySelector(".signUp").classList.add("active-sx");
	document.querySelector(".signIn").classList.add("inactive-dx");
	document.querySelector(".signIn").classList.remove("active-dx");
	document.querySelector(".signUp").classList.remove("inactive-sx");
});

document.querySelector(".sign-up").addEventListener("click", (event) => {
	event.preventDefault()
	let email = document.querySelector(".email").value
	let password = document.querySelector(".password").value
	let name = document.querySelector(".name").value
	let account = {
		email: email,
		password: password,
		name: name
	}
	call_API_SignUp(account)
})
let login_submit = document.querySelector(".log-in-submit")
login_submit.addEventListener("click", async (event) => {
	event.preventDefault()
	login_submit.classList.add("fa-bounce")
	setTimeout(() => {
		login_submit.classList.remove("fa-bounce")
	}, 2000);
	if (document.querySelector(".email-log-in").value != "") {
		console.log("email exist, calling api...")
		let email = document.querySelector(".email-log-in").value
		let password = document.querySelector(".password-log-in").value
		await LS.setItem("Registered_Email", email)
		let account = {
			email: email,
			password: password,
		}
		call_API_LogIn(account)
	}
})

function call_API_SignUp(account_details) {
    console.log("**Signing Up, Calling API***")
    console.log(account_details)
    params = {
        email: account_details.email,
        password: account_details.password,
        name: account_details.name
    }
    var esc = encodeURIComponent;
    var query_params = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
    let api_URL = api_SignUp + query_params
    fetch(api_URL, {

    // Adding method type
    method: "GET"
})

// Converting to JSON
.then(response => response.json())

.then(async (json) => {
	if (json.user_token != "") {
		console.log(json)
		await LS.setItem("user_token", json.user_token)
		await LS.setItem("Registered_Name", account_details.name)
		await LS.setItem("Registered_Email", account_details.email)
		chrome.notifications.create({
			type: 'basic',
			iconUrl: '../Images/128.png',
			title: `Huyp - Signed Up Successfully`,
			message: "Welcome to Huyp!",
			priority: 1
			})
	}
	else throw json.error
})
.then(function (json) { 
	chrome.runtime.sendMessage({message: "Open Payment Page"})
	window.close()
})

.catch(function (err) {
	chrome.notifications.create({
		type: 'basic',
		iconUrl: '../Images/128.png',
		title: `Huyp - Error Signing Up`,
		message: JSON.stringify(err),
		priority: 1
	})
	document.getElementById("error-signup").innerText = JSON.stringify(err)
}
)}
function call_API_LogIn(account_details) {
    console.log("**Logging in, Calling API***")
    console.log(account_details)
    params = {
        email: account_details.email,
        password: account_details.password
	}
    var esc = encodeURIComponent;
    var query_params = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
    let api_URL = api_LogIn + query_params
    fetch(api_URL, {

    // Adding method type
    method: "GET"
})

// Converting to JSON
.then(response => response.json())

.then(async (json) => {
	if (json.user_token != "") {
		console.log(json)
		await LS.setItem("user_token", json.user_token)
		chrome.notifications.create({
			type: 'basic',
			iconUrl: '../Images/128.png',
			title: `Huyp - Logged In Successfully`,
			message: "Welcome Back!",
			priority: 1
			})
	}
	else throw json.error
})
.then((json) => window.close())

.catch(function (err) {
	chrome.notifications.create({
		type: 'basic',
		iconUrl: '../Images/128.png',
		title: `Huyp - Error Logging In`,
		message: JSON.stringify(err),
		priority: 1
	})
	document.getElementById("error-login").innerText = JSON.stringify(err)
}
)}