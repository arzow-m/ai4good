const LABEL_INFO = {
  'Call': {
    description: 'An encouragement to act or think in a particular way rather than presenting an argument. Uses slogans, urgency, or conversation-ending tactics.',
    techniques: 'Slogans, Appeal to time, Conversation killer'
  },
  'Justification': {
    description: 'An argument made of two parts: a statement and a justification. Often appeals to authority, popularity, or fear without solid evidence.',
    techniques: 'Appeal to Authority, Appeal to Popularity, Appeal to Fear, Flag Waving'
  },
  'Manipulative Wording': {
    description: 'Language that is non-neutral, confusing, or exaggerating in order to impact the reader emotionally rather than logically.',
    techniques: 'Loaded Language, Repetition, Exaggeration, Obfuscation'
  },
  'Attack on Reputation': {
    description: 'An argument whose object is not the topic but the personality of a participant, used to question or undermine their credibility.',
    techniques: 'Name Calling, Doubt, Guilt by Association, Appeal to Hypocrisy'
  },
  'Simplification': {
    description: 'A statement that excessively simplifies a problem, usually regarding its cause, consequence, or the available choices.',
    techniques: 'False Dilemma, Causal Oversimplification, Consequential Oversimplification'
  },
  'None': {
    description: 'No manipulation techniques detected in this post.',
    techniques: null
  }
}

const THRESHOLD = 0.5
let currentHostname = null

// Tabs
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'))
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'))
    tab.classList.add('active')
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden')
  })
})

function renderTechniques(predictions, text, hostname) {
  const list = document.getElementById('techniques-list')
  const snippet = document.getElementById('post-snippet')

  if (!predictions) return

  if (text) {
    const snippetText = text.length > 150 ? text.slice(0, 150) + '...' : text
    const existing = snippet.querySelector('.snippet-favicon')
    if (!existing || hostname !== currentHostname) {
      currentHostname = hostname
      const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
      snippet.innerHTML = `
        <div class="snippet-header">
          <img src="${favicon}" class="snippet-favicon" alt="" />
          <p class="snippet-text">${snippetText}</p>
        </div>`
    } else {
      snippet.querySelector('.snippet-text').textContent = snippetText
    }
    snippet.classList.remove('hidden')
  }

  const allLabels = Object.entries(predictions)
    .map(([name, probability]) => ({ name, probability, info: LABEL_INFO[name] }))
    .sort((a, b) => b.probability - a.probability)

  const detected = allLabels.filter(l => l.probability >= THRESHOLD && l.name !== 'None')
  document.getElementById('issue-count').textContent = detected.length

  function renderCard(item) {
    const pct = (item.probability * 100).toFixed(1)
    const muted = item.probability < THRESHOLD
    const cardClass = muted ? 'technique-card muted' : 'technique-card high'
    const desc = item.info ? item.info.description : ''
    const techs = item.info ? item.info.techniques : null
    return `
      <div class="${cardClass}">
        <div class="technique-header">
          <div class="technique-body">
            <div class="technique-name-row">
              <div class="technique-name">${item.name}</div>
              <div class="technique-confidence">${pct}%</div>
            </div>
            <div class="confidence-bar">
              <div class="confidence-fill ${muted ? 'muted-fill' : ''}" style="width:${pct}%"></div>
            </div>
            <div class="technique-desc">${desc}</div>
            ${techs ? `<div class="technique-tags"><span class="technique-tags-label">Common patterns: </span>${techs}</div>` : ''}
          </div>
        </div>
      </div>`
  }

  list.innerHTML = allLabels.map(item => renderCard(item)).join('')
}

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'analysisResult') {
    renderTechniques(message.predictions, message.text, message.hostname)
  }
})

// Chat
const chatMessages = document.getElementById('chat-messages')
const chatEmpty = document.getElementById('chat-empty')
const chatInput = document.getElementById('chat-input')

function addMessage(role, content) {
  chatEmpty.style.display = 'none'
  const div = document.createElement('div')
  div.className = `chat-message ${role}`
  div.textContent = content
  chatMessages.appendChild(div)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function sendMessage() {
  const text = chatInput.value.trim()
  if (!text) return
  addMessage('user', text)
  chatInput.value = ''
  setTimeout(() => addMessage('assistant', 'Chat with the API coming soon.'), 250)
}

document.getElementById('chat-send').addEventListener('click', sendMessage)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage()
})

// Settings
document.querySelectorAll('.color-swatch').forEach((swatch) => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'))
    swatch.classList.add('active')
  })
})

renderTechniques(null, null, null)