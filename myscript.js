function appendMessage(el, message, color) {
    var msgElement = document.createElement("p")
    msgElement.appendChild(document.createTextNode(message))
    el.style.border = "2px solid " + color

    el.insertBefore(msgElement, el.firstChild)
}

function markAsRead() {
    let unobserved = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.seen)')
    
    for (let i = 0; i < unobserved.length; i++) {
        let post = unobserved[i]
        observer.observe(post);
    }
}

function intersectionCallback(entry) {
    entry = entry[0]
    let position = entry.boundingClientRect

    if(-position.y > position.height) {
        let el = entry.target
        observer.unobserve(el)
        appendMessage(el, "Post: Seen", "blue")
        el.className += " seen";
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
    let feed = document.querySelector('[id^="topnews_main_stream_"]')
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    }
    observer = new IntersectionObserver(intersectionCallback, observerOptions)
    appendMessage(feed, "Main Feed:", "black")
    markAsRead()
    startTimer()
}



init()





