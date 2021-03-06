function pageLoaded() {
	$('doneButton').addEvent('click', function(event) {
		safari.self.hide();
	});
	getAccounts();
}

function performCommand(event) {
	switch (event.command) {
	case 'BugMeNotButton':
	case 'BugMeNotContext':
		if (safari.self.browserWindow != app.activeBrowserWindow)
			return;
		showHide();
	}
}

function validateCommand(event) {
	if (safari.self.visible) {
		if (app.activeBrowserWindow.activeTab.url != tabURL) {
			tabURL = app.activeBrowserWindow.activeTab.url
			getAccounts();
		}
	}
	if (event.command == 'BugMeNotContext') {
		if (safari.self.visible) {
			event.target.title = 'Hide BugMeNot Bar';
		} else {
			event.target.title = 'Show BugMeNot Bar'; 
		}
	}
}

function showHide() {
	if (safari.self.visible) {
		safari.self.hide();
	} else {
		safari.self.show();
		getAccounts();
	}
}

function getAccounts() {
	if (safari.self.browserWindow != app.activeBrowserWindow)
			return;
	accountContainer = $('accountContainer');
	accountContainer.innerHTML = '<div class="message">Searching for accounts...</div>';
	var currentURL = app.activeBrowserWindow.activeTab.url;
	if (!currentURL) {
		accountContainer.innerHTML = '<div class="message">No  accounts found</div>';
		return;
	}
	var domain = getHostname(currentURL);
	var bmnURL = 'http://www.bugmenot.com/view/'+escape(domain)+'?utm_source=extension&utm_medium=firefox';
	var req = new XMLHttpRequest();
	req.open('GET', bmnURL, true);
	req.onreadystatechange = function (aEvt) {  
		if (req.readyState == 4) {  
			if(req.status == 200) {
				accountsArray = parseAccounts(req.responseText);
				accountContainer.innerHTML = '';
				for (var i=0; i<accountsArray.length; i++) {
					accountContainer.innerHTML += '<span class="container" id="container'+i+'"><button type="button" onclick="clickAccount(accountsArray['+i+']);" title="Choose this username/password" class="account">'+accountsArray[i].login+'/'+accountsArray[i].password+' '+accountsArray[i].rating+'%</button><button type="button" onclick="removeAccount('+i+');" title="Remove this username/password from the list" class="cross">X</button></span> ';
				}
				accountContainer.innerHTML += '<a href="http://www.bugmenot.com/view/'+escape(domain)+'">Provided by BugMeNot.com</a>';
			} else {
				accountContainer.innerHTML = '<div class="message">No accounts found</div>';
			}
		}  
	};
	req.send(null);
}

function getHostname(str) {
	var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
	return str.match(re)[1].toString();
}

function parseAccounts(responseText) {
	var range = document.createRange();
	range.selectNode(document.body);
	var parsedHTML = range.createContextualFragment(responseText);
	var loginNodes = parsedHTML.querySelectorAll('.account tr:nth-child(1) td');
	if (loginNodes.length) {
		var passwordNodes = parsedHTML.querySelectorAll('.account tr:nth-child(2) td');
		var statsNodes = parsedHTML.querySelectorAll('.account tr:nth-child(4) td');
		var accounts = new Array();
		for (var i=0; i<loginNodes.length; i++) {
			if (loginNodes[i].textContent && passwordNodes[i].textContent) {
				accounts.push( {
					login : loginNodes[i].textContent,
					password : passwordNodes[i].textContent,
					rating : parseInt(statsNodes[i].textContent.split('%')[0], 10),
				});
			}
		}
		return accounts;
	}
}

function clickAccount(account) {
	app.activeBrowserWindow.activeTab.page.dispatchMessage('fillLogin', account);
}

function removeAccount(i) {
	var toDelete = $('container'+i),
		accountContainer = $('accountContainer');
	toDelete.set('tween', {
		duration: 200,
		onComplete: function() {
			var myFx = new Fx.Slide(toDelete,{
				duration:300,
				mode:'horizontal',
				wrapper: new Element('span'),
				onComplete: function() {
					toDelete.destroy();
				}
			}).slideOut();
		}
	}).fade('out');
}

var app = safari.application,
	tabURL = '',
	accountsArray = new Array();
	
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
window.addEvent('domready', pageLoaded, false);
