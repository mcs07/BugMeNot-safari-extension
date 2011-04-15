safari.self.addEventListener("message", handleMessage, false);

function handleMessage(msgEvent) {
    if (msgEvent.name === "fillLogin") {
        var username = msgEvent.message.login;
        var password = msgEvent.message.password;
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