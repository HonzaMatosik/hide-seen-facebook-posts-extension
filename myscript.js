function markAsRead() {
    let unobserved = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.seen):not(.watching)')

    for (let i = 0; i < unobserved.length; i++) {
        let post = unobserved[i]
        isSeen(post)
    }
}

function intersectionCallback(entry) {
    entry = entry[0]
    let position = entry.boundingClientRect

    if(-position.y > position.height) {
        let el = entry.target
        setSeen(el.getAttribute('data-dedupekey'))
        observer.unobserve(el)
        el.className += " seen"
        el.style.border= "2px solid blue"
    }
}

function startTimer() {
    interval = setInterval( function(){
        clearInterval(interval)
        markAsRead()
        startTimer()
    }, 1000)
}

function initDexieDB() {
    var db = new Dexie("seen_posts")
    db.version(1).stores({
        posts: 'id'
    })
    return db
    
}

function init() {
    db = initDexieDB()
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
    db.posts.put({id: id})
}

function isSeen(post) {
    let id = post.getAttribute('data-dedupekey')
    db.posts.get(id).then(function (row) {
        if (typeof row != 'undefined') {
            post.className += " seen"
            post.style.border= "2px solid blue"
        } else {
            post.className += " watching"
            observer.observe(post)
        }
    })
}

window.onload = function() {
    init()
};






