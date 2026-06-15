const SELECTORS = {
  'twitter.com': '[data-testid="tweetText"]',
  'x.com': '[data-testid="tweetText"]',
  'facebook.com': '[data-ad-comet-preview="message"]',
  'instagram.com': 'span._ap3a._aaco._aacu._aacx._aad7._aade'
}

function getSelector() {
  const domain = Object.keys(SELECTORS).find(d =>
    window.location.hostname.includes(d)
  )
  return domain ? SELECTORS[domain] : 'article p, [role="article"] p, main p'
}

const seen = new Set()

function handleText(el) {
  const text = el.innerText.trim()
  if (!text) return
  if (seen.has(text)) return
  seen.add(text)
  console.log("Perspect found:", text)
}

const viewportObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return
    handleText(entry.target)
  })
})

const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return
      node.querySelectorAll(getSelector()).forEach(el => viewportObserver.observe(el))
    })

    if (mutation.type === 'characterData' || mutation.type === 'childList') {
      const el = mutation.target.closest?.(getSelector())
      if (el) handleText(el)
    }
  })
})

mutationObserver.observe(document.body, { childList: true, subtree: true, characterData: true })

document.querySelectorAll(getSelector()).forEach(el => viewportObserver.observe(el))