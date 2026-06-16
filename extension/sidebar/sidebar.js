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
  'Reputation': {
    description: 'An argument whose object is not the topic but the personality of a participant, used to question or undermine their credibility.',
    techniques: 'Name Calling, Doubt, Guilt by Association, Appeal to Hypocrisy'
  },
  'Simplification': {
    description: 'A statement that excessively simplifies a problem, usually regarding its cause, consequence, or the available choices.',
    techniques: 'False Dilemma, Causal Oversimplification, Consequential Oversimplification'
  },
  'None': null
}

// Tabs
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
  });
});

// Analysis
function renderTechniques(label, text) {
  const list = document.getElementById('techniques-list')
  const info = LABEL_INFO[label]
  const snippet = document.getElementById('post-snippet')
  const snippetText = document.getElementById('snippet-text')

  if (text) {
    snippetText.textContent = text.length > 150 ? text.slice(0, 150) + '...' : text
    snippet.classList.remove('hidden')
  }

  if (!info) {
    document.getElementById('issue-count').textContent = '0'
    list.innerHTML = `
      <div class="technique-card low">
        <div class="technique-header">
          <span class="technique-icon">&#10003;</span>
          <div>
            <div class="technique-name">None</div>
            <div class="technique-desc">No manipulation techniques detected in this post.</div>
          </div>
        </div>
      </div>`
    return
  }

  document.getElementById('issue-count').textContent = '1'
  list.innerHTML = `
    <div class="technique-card high">
      <div class="technique-header">
        <span class="technique-icon">&#9888;</span>
        <div>
          <div class="technique-name">${label}</div>
          <div class="technique-desc">${info.description}</div>
        </div>
      </div>
      <div class="technique-severity">${info.techniques}</div>
    </div>`
}

function showNeutral(text) {
  document.getElementById('neutral-text').textContent = `"${text}"`;
  document.getElementById('neutral-box').classList.remove('hidden');
  document.getElementById('generate-btn').style.display = 'none';
}

document.getElementById('generate-btn').addEventListener('click', () => {
  showNeutral('Neutral version generation requires the explanation API.')
})

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'analysisResult') {
    renderTechniques(message.label, message.text)
  }
})

// Chat
const chatMessages = document.getElementById('chat-messages');
const chatEmpty = document.getElementById('chat-empty');
const chatInput = document.getElementById('chat-input');

function addMessage(role, content) {
  chatEmpty.style.display = 'none';
  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.textContent = content;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage('user', text);
  chatInput.value = '';
  setTimeout(() => addMessage('assistant', "Chat with the API coming soon."), 250);
}

document.getElementById('chat-send').addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Settings
document.querySelectorAll('.color-swatch').forEach((swatch) => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
    swatch.classList.add('active');
  });
});

renderTechniques('None')