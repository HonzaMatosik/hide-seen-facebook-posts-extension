function appendMessage(el, message, color) {
    var msgElement = document.createElement("p")
    msgElement.appendChild(document.createTextNode(message))
    el.style.border = "4px solid " + color

    el.insertBefore(msgElement, el.firstChild)
}

function markAsRead() {
    var substream = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.seen)')
  
    for (var i = 0; i < substream.length; i++) {
        var post = substream[i]
        appendMessage(post, "Post:", "blue")
        post.className += " seen";
    }
}

function startTimer() {
    interval = setInterval( function(){
        clearInterval(interval)
        markAsRead()
        startTimer()
    }, 5000)
}

function init() {
    feed = document.querySelector('[id^="topnews_main_stream_"]')
    appendMessage(feed, "Main Feed:", "black")
    markAsRead()
    startTimer()
}



init()





