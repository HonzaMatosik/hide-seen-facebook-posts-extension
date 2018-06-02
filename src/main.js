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
        el.classList.add(seenClass)
    }
}

function waitForMainStream() {
	return new Promise((resolve, reject) => {
		let interval = setInterval(function () {
			if (document.querySelector('[id^="'+mainStreamIdPrefix+'"]') != null) {
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
				clearInterval(interval)
				resolve()
			}
		}, 100)
	})
}

function checkInitialPosts() {
    const unobserved = document.querySelectorAll('[id^="hyperfeed_story_id_"]:not(.'+seenClass+'):not(.'+watchingClass+')')

    for (let i = 0; i < unobserved.length; i++) {
        const post = unobserved[i]
        post.style.display = 'none'
        isSeen(post)
    }
}

function updateCounter() {
    const counterElement = document.getElementById(barId)
    if (counterElement != null) {
	    const hiddenPostCount = document.querySelectorAll('.' + seenClass).length
	    counterElement.textContent = hiddenPostCount
	}
}

function isSeen(post) {
    const id = post.getAttribute('data-dedupekey')
    if (id != null) {
	    db.posts.get(id).then(function (row) {
	        if (typeof row != 'undefined') {
	            post.classList.add(seenClass)
	            updateCounter()
	        } else {
	            post.style.display = ''
	            if (! post.classList.contains(watchingClass)) {
	                post.classList.add(watchingClass)
	                observer.observe(post)
	            }
	        }
	    })
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
    let div = document.createElement('div')
    div.setAttribute('style', 'background-color: white;padding: 10px;margin: 0px -1px 10px;border-radius: 4px;border: 1px solid #dedfe2;')
    
    let span = document.createElement('span')
    span.setAttribute('id', barId)
    span.appendChild(document.createTextNode("0"))

    let showHiddenPostsDiv = document.createElement('div')
    showHiddenPostsDiv.setAttribute('id', buttonId)
    showHiddenPostsDiv.appendChild(document.createTextNode("Show hidden posts"))
    showHiddenPostsDiv.addEventListener("click", showAllPosts)


	div.appendChild(span)
	div.appendChild(document.createTextNode(" seen posts hidden."))
	div.appendChild(showHiddenPostsDiv)

    const feed = document.querySelector('[id^="'+mainStreamIdPrefix+'"]')
    feed.parentElement.insertBefore(div, feed)
}

function start() {
	running = true
	checkInitialPosts()
	initMutationObserver()
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

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

function generateRandom(type) {
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	while (true) {
		let firstLetter = possible[getRandomInt(0, 51)]
		let length = getRandomInt(3, 10)
		let rand = Math.random().toString(36).substr(2, length)
		let name = firstLetter + rand
		if (document.querySelector(name) == null) 
			return name 
	}
}

function injectStyles() {
	let feedId = document.querySelector('[id^="'+mainStreamIdPrefix+'"]').getAttribute('id')
	barId = generateRandom("#")
	seenClass = generateRandom(".")
	watchingClass = generateRandom(".")
	buttonId = generateRandom("#")

	let styles = `
	#`+buttonId+` {
		float: right;
		color: #365899;
		font-weight: 700;
		cursor: pointer;
		padding: 4px;
		margin: -4px;
	}
	#`+buttonId+`:hover {
		background-color: #f6f7f9
	}
	#`+feedId+` {
		padding-bottom: `+screen.height+`px
	}
	`

	const head = document.head
	const style = document.createElement("style")
	style.appendChild(document.createTextNode(styles))
	head.appendChild(style)
}

function showAllPosts() {
	mutationObserver.disconnect()
	hiddenPosts = document.querySelectorAll('.' + seenClass)
	for (let i = 0; i < hiddenPosts.length; i++) {
		hiddenPosts[i].style.display = ''
	}
	
	const button = document.getElementById(buttonId)
	button.textContent = "Refresh to start hiding seen posts again"
	button.removeEventListener("click", showAllPosts)
	button.addEventListener("click", function(){
		window.location.reload(false)
	})

	document.getElementById(barId).outerHTML = "0"
}

mainStreamIdPrefix = "topnews_main_stream_"

db = initDexieDB()
injectStyles()
observer = new IntersectionObserver(intersectionCallback, {threshold: [ 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 ]})

running = false
startLoop()

