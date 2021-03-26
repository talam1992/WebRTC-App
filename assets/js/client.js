var connection = new WebSocket('ws://localhost:9090');

connection.onopen = function(){
    console.log("Connected to the server");
}

connection.onmessage = function(msg) {
    var data = JSON.parse(msg.data);
    switch(data.type) {
        case "login":
            loginProcess(data.success);
            break;
        case "offer":
            offerProcess(data.offer, data.name);
            break;
        case "answer":
            answerProcess(data.answer);
            break;
    }
}

connection.onerror = function(error) {
    console.log(error);
}

var connected_user;
var local_video = document.querySelector("#local-video");
var call_btn = document.querySelector("#call-btn");
var call_to_username_input = document.querySelector("#username-input");

call_btn.addEventListener("click", function(){
    var call_to_username = call_to_username_input.value;
    
    if(call_to_username.length > 0) {
        connected_user = call_to_username;
        myConn.createOffer(function(offer){
            send({
                type:"offer",
                offer: offer
            })
            myConn.setLocalDescription(offer)
        }, function(error){
            alert("Offer has not created")
        })
    }

})

var name;
var connectedUser
var myConn;
var url_string = window.location.href;
var url = new URL(url_string);
var username = url.searchParams.get("username");

setTimeout(function () {

    if (connection.readyState === 1) {

        if (username != null) {
            name = username;
            if (name.length > 0) {
                send({
                    type: "login",
                    name: name
                })
            }
        }
    } else {
        console.log("Connection has not stublished");
    }
}, 3000)

function send(message) {
    if(connected_user) {
        message.name = connected_user;
    }
    connection.send(JSON.stringify(message))
}

function loginProcess(success){
    if(success === false) {
        alert("Try a different username")
    }else{
        navigator.getUserMedia({
            video: true,
            audio:true
        }, function(myStream){
            stream = myStream;
            local_video.srcObject = stream;
            var configuration = {
                "iceServers": [{
                    "url":"stun:stun2.1.google.com:19302"
                }]
            }
            myConn = new webkitRTCPeerConnection(configuration, {
                optional: [{
                    RtpDataChannels: true
                }]
            });
    
            myConn.addStream(stream);

        }, function(error){
            console.log(error);
        });
        

    }
}

function offerProcess(offer, name) {
    connected_user = name;
    myConn.setRemoteDescription(new RTCSessionDescription(offer))
    alert(name);
    //create answer to an offer or user A.
    myConn.createAnswer(function (answer) {
        myConn.setLocalDescription(answer);
        send({
            type: "answer",
            answer: answer
        })
    }, function (error) {
        alert("Answer has not created");
    })
}

function answerProcess(answer) {
    myConn.setRemoteDescription(new RTCSessionDescription(answer));
}