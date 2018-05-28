function initDexieDB() {
    const db = new Dexie("seen_posts")
    db.version(1).stores({
        posts: 'id'
    })
    return db
}


function setSeen(id, timestamp) {
    db.posts.put({id: id, timestamp: timestamp})
}


function intersectionCallback(entry) {
    entry = entry[0]
    const position = entry.boundingClientRect

    if(-position.y > position.height) {
        const el = entry.target
        setSeen(el.getAttribute('data-dedupekey'), el.getAttribute('data-timestamp'))
        observer.unobserve(el)
        el.classList.add('seen')
    }
}

function waitForMainStream() {
	return new Promise((resolve, reject) => {
		let interval = setInterval(function () {
			if (document.querySelector('[id^="'+mainStreamIdPrefix+'"]') != null) {
				console.log("mainstream found")
				clearInterval(interval)
		       	resolve()
		    }
		}, 100)
	})
}

function waitForMainStreamRemove() {
	return new Promise((resolve, reject) => {
		let interval = setInterval(function () {
			if (document.querySelector('[id^="'+mainStreamIdPrefix+'"]') == null) {
				console.log("mainstream removed!")
				clearInterval(interval)
				resolve()
			}
		}, 100)
	})
}

function checkInitialPosts() {
    const unobserved = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.seen):not(.watching)')

    for (let i = 0; i < unobserved.length; i++) {
        const post = unobserved[i]
        post.style.display = 'none'
        isSeen(post)
    }
}

function updateCounter() {
    const counterElement = document.getElementById('seen-posts-notification-2423423')
    counterElement.innerHTML = ++counter
}

function isSeen(post) {
    const id = post.getAttribute('data-dedupekey')
    if (id != null) {
	    db.posts.get(id).then(function (row) {
	        if (typeof row != 'undefined') {
	            post.classList.add('seen')
	            updateCounter()
	        } else {
	            post.style.display = ''
	            if (! post.classList.contains('watching')) {
	                post.classList.add('watching')
	                observer.observe(post)
	            }
	        }
	    })
	} else {
		console.log(post)
	}
}

function initMutationObserver() {
    const target = document.querySelector('[id^="'+mainStreamIdPrefix+'"]')
    const config = { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["id"]}
    mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id.includes('hyperfeed_story_id')) {
                mutation.target.style.display = 'none'
                isSeen(mutation.target)
            }
        })
    })
    mutationObserver.observe(target, config)
}

function addNotificationBar() {
    var div = document.createElement('div')
    div.setAttribute('style', 'background-color: white;padding: 10px;margin: 0px -1px 10px;border-radius: 4px;border: 1px solid #dedfe2;')
    div.innerHTML = 'Skryto <span id="seen-posts-notification-2423423">' + counter +'</span> přečtených příspěvků'

    const feed = document.querySelector('[id^="topnews_main_stream_"]')
    feed.parentElement.insertBefore(div, feed)
    feed.style = 'padding-bottom: ' + screen.height + 'px'
}

function start() {
	console.log("Starting!")
	running = true
	checkInitialPosts()
	initMutationObserver()
	counter = 0
    addNotificationBar()
}

async function startLoop() {
	setTimeout( async function() { 
		if (running == true) {
			await waitForMainStreamRemove()
			mutationObserver.disconnect()
		}
		await waitForMainStream()
		start()
		startLoop()
	}, 100)
}

mainStreamIdPrefix = "topnews_main_stream_"
db = initDexieDB()
observer = new IntersectionObserver(intersectionCallback, {threshold: [ 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 ]})

running = false
startLoop()

