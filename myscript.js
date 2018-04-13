function checkInitialPosts() {
    const unobserved = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.seen):not(.watching):not(.seen)')

    for (let i = 0; i < unobserved.length; i++) {
        const post = unobserved[i]
        post.style.display = 'none'
        isSeen(post)
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

function initDexieDB() {
    const db = new Dexie("seen_posts")
    db.version(1).stores({
        posts: 'id'
    })
    return db
}

function initMutationObserver() {
    const target = document.querySelector('[id^="topnews_main_stream_"]')
    const config = { attributes: true, childList: true, characterData: true, subtree: true }
    const mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            
            if (mutation.type == 'childList' && mutation.target.id.includes('hyperfeed_story_id')) {
                mutation.target.style.display = 'none'
                isSeen(mutation.target)
            }
        })
    })
    mutationObserver.observe(target, config)
}

function init() {
    db = initDexieDB()
    observer = new IntersectionObserver(intersectionCallback, {threshold: [ 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0 ]})
    initMutationObserver();
    checkInitialPosts()
}

function setSeen(id) {
    db.posts.put({id: id})
}

function isSeen(post) {
    const id = post.getAttribute('data-dedupekey')
    db.posts.get(id).then(function (row) {
        if (typeof row != 'undefined') {
            post.classList.add('seen')
        } else {
            post.style.display = ''
            if (! post.classList.contains('watching')) {
                post.classList.add('watching')
                observer.observe(post)
            }
        }
    })
}

window.onload = function() {
    init()
}
