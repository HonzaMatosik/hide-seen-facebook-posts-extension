function markAsRead() {
    let unobserved = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.seen)')

    for (let i = 0; i < unobserved.length; i++) {
        let post = unobserved[i]
        if (isSeen(post.getAttribute('data-dedupekey'))) {
            post.className += " seen";
            post.style.display= "none";
        } else {
            observer.observe(post)
        }
    }
}

function intersectionCallback(entry) {
    entry = entry[0]
    let position = entry.boundingClientRect

    if(-position.y > position.height) {
        let el = entry.target
        setSeen(el.getAttribute('data-dedupekey'))
        observer.unobserve(el)
        el.className += " seen";
    }
}

function startTimer() {
    interval = setInterval( function(){
        clearInterval(interval)
        markAsRead()
        startTimer()
    }, 1000)
}

function init() {
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    }
    observer = new IntersectionObserver(intersectionCallback, observerOptions)
    
    markAsRead()
    startTimer()
}

function setSeen(id) {
    localStorage.setItem(id, true)
}

function isSeen(id) {
    return localStorage.getItem(id)
}

init()





