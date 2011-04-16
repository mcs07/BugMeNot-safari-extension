safari.self.addEventListener('message', handleMessage, false);

function handleMessage(msg) {
    if (msg.name === 'fillLogin') {
        var username = msg.message.login;
        var password = msg.message.password;
        var ufields = document.body.querySelectorAll('input[type="text"]')
        for(var i=0; i<ufields.length; i++) {
            ufields[i].value = username;
        }
        var pfields = document.body.querySelectorAll('input[type="password"]')
        for(var i=0; i<pfields.length; i++) {
            pfields[i].value = password;
        }
    }
}
