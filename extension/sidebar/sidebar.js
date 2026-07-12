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
const API_URL = 'http://localhost:8000'

let currentHostname = null
let currentPredictions = null
let currentPostText = null
let chatHistory = []

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
    currentPredictions = message.predictions
    currentPostText = message.text
    currentHostname = message.hostname
    renderTechniques(message.predictions, message.text, message.hostname)

    const scoresStr = Object.entries(message.predictions)
      .sort((a, b) => b[1] - a[1])
      .map(([label, prob]) => `${label}: ${(prob * 100).toFixed(1)}%`)
      .join(', ')

    chatHistory.push({
      role: 'user',
      content: `[New post from ${message.hostname}]: "${message.text.slice(0, 150)}" — Model scores: ${scoresStr}`
    })
    chatHistory.push({
      role: 'assistant',
      content: `Got it. I've noted the new post and its detection scores. What would you like to know?`
    })
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
  if (role === 'assistant') {
    div.innerHTML = content
  } else {
    div.textContent = content
  }
  chatMessages.appendChild(div)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text) return
  addMessage('user', text)
  chatInput.value = ''

  chatHistory.push({ role: 'user', content: text })

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        post_text: currentPostText || '',
        predictions: currentPredictions || {},
        hostname: currentHostname || '',
        history: chatHistory.slice(0, -1)
      })
    })
    const data = await res.json()
    addMessage('assistant', data.response)
    chatHistory.push({ role: 'assistant', content: data.response })
  } catch (err) {
    addMessage('assistant', 'Something went wrong. Please try again.')
    console.error('Perspect chat error:', err)
  }
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

// Help tab
const contestToggle = document.getElementById('contest-toggle')
const contestForm = document.getElementById('contest-form')
const contestChevron = document.getElementById('contest-chevron')
const submitReport = document.getElementById('submit-report')
const reportAgain = document.getElementById('report-again')
const reportText = document.getElementById('report-text')
const reportReason = document.getElementById('report-reason')
let selectedLabels = []

contestToggle.addEventListener('click', () => {
  const isHidden = contestForm.classList.toggle('hidden')
  contestChevron.innerHTML = isHidden 
  ? '<img src="../icons/chevron-down.svg" class="help-icon" alt="" />'
  : '<img src="../icons/chevron-up.svg" class="help-icon" alt="" />'
})

document.querySelectorAll('.label-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected')
    const label = chip.dataset.label
    if (selectedLabels.includes(label)) {
      selectedLabels = selectedLabels.filter(l => l !== label)
    } else {
      selectedLabels.push(label)
    }
    validateForm()
  })
})

function validateForm() {
  const valid = reportText.value.trim() && selectedLabels.length > 0 && reportReason.value.trim()
  submitReport.disabled = !valid
}

reportText.addEventListener('input', validateForm)
reportReason.addEventListener('input', validateForm)

submitReport.addEventListener('click', () => {
  //stub for now
  console.log('Report submitted:', {
    text: reportText.value,
    labels: selectedLabels,
    reason: reportReason.value
  })
  document.getElementById('report-form-fields').classList.add('hidden')
  document.getElementById('report-success').classList.remove('hidden')
})

reportAgain.addEventListener('click', () => {
  reportText.value = ''
  reportReason.value = ''
  selectedLabels = []
  document.querySelectorAll('.label-chip').forEach(c => c.classList.remove('selected'))
  submitReport.disabled = true
  document.getElementById('report-form-fields').classList.remove('hidden')
  document.getElementById('report-success').classList.add('hidden')
})