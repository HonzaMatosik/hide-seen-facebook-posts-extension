function markAsRead() {
    const unobserved = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.seen)')

    for (let i = 0; i < unobserved.length; i++) {
        const post = unobserved[i]
        if (isSeen(post.getAttribute('data-dedupekey'))) {
            post.classList.add('seen')
            post.style.display = 'none'
        } else {
            observer.observe(post)
        }
    }
}

function intersectionCallback(entry) {
    entry = entry[0]
    const position = entry.boundingClientRect

    if(-position.y > position.height) {
        const el = entry.target
        setSeen(el.getAttribute('data-dedupekey'))
        observer.unobserve(el)
        el.classList.add('seen')
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
        threshold: [ 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0 ],
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

window.onload = function() {
    init()
}
