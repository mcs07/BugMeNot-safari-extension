safari.application.addEventListener("command", performCommand, false);
safari.application.addEventListener("validate", validateCommand, false);

var tabURL;
var accountsArray;

function performCommand(event) {
    if (event.command === "showhide") {
    	if (safari.self.browserWindow != safari.application.activeBrowserWindow)
			return;
        if (safari.self.visible) {
            safari.self.hide();
        } else {
            safari.self.show();
            getAccounts();
        }
    }
}

function getHostname(str) {
	var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
	return str.match(re)[1].toString();
}

function getAccounts() {
	if (safari.self.browserWindow != safari.application.activeBrowserWindow)
			return;
    document.body.innerHTML = "Searching for accounts...";
    var currentURL = safari.application.activeBrowserWindow.activeTab.url;
    if (!currentURL) {
    	document.body.innerHTML = "No  accounts found";
    	return;
    }
    var domain = getHostname(currentURL);
    var bmnURL = 'http://www.bugmenot.com/view/'+escape(domain)+'?utm_source=extension&utm_medium=firefox';
    console.log(bmnURL);
    var req = new XMLHttpRequest();
    req.open('GET', bmnURL, true);
    req.onreadystatechange = function (aEvt) {  
        if (req.readyState == 4) {  
            if(req.status == 200) {
                accountsArray = parseAccounts(req.responseText);
                document.body.innerHTML = '';
                for (var i=0; i<accountsArray.length; i++) {
                    document.body.innerHTML += '<span class="container" id="container'+i+'"><button type="button" onclick="clickAccount(accountsArray['+i+']);" title="Choose this username/password" class="account">'+accountsArray[i].login+'/'+accountsArray[i].password+' '+accountsArray[i].rating+'%</button><button type="button" onclick="removeAccount('+i+');" title="Remove this username/password from the list" class="cross">X</button></span> ';
                }
                document.body.innerHTML += '<a href="http://www.bugmenot.com/view/'+escape(domain)+'">Provided by BugMeNot.com</a>';
            } else {
                document.body.innerHTML = "No accounts found";
            }
        }  
    };
    req.send(null);
}

function parseAccounts(responseText) {
	var range = document.createRange();
	range.selectNode(document.body);
	var parsedHTML = range.createContextualFragment(responseText);
	var loginNodes = parsedHTML.querySelectorAll(".account tr:nth-child(1) td");
	if (loginNodes.length) {
        var passwordNodes = parsedHTML.querySelectorAll(".account tr:nth-child(2) td");
		var statsNodes = parsedHTML.querySelectorAll(".account tr:nth-child(4) td");
        var accounts = new Array();
		for (var i=0; i<loginNodes.length; i++) {
			if (loginNodes[i].textContent && passwordNodes[i].textContent) {
				accounts.push( {
					login : loginNodes[i].textContent,
					password : passwordNodes[i].textContent,
					rating : parseInt(statsNodes[i].textContent.split("%")[0], 10),
				});
			}
        }
        return accounts;
	}
}

function clickAccount(account) {
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("fillLogin", account);
}

function removeAccount(i) {
    var toDelete = document.body.querySelector('#container'+i);
        toDelete.parentNode.removeChild(toDelete);
}

function validateCommand(event) {    
    if (safari.self.visible) {
        if (safari.application.activeBrowserWindow.activeTab.url !== tabURL) {
            tabURL = safari.application.activeBrowserWindow.activeTab.url
            getAccounts();
        }
    }
}
