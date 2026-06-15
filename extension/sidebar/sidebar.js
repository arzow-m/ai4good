const SAMPLE = {
  techniques: [
    {
      name: 'Bandwagon Appeal',
      description: "Uses 'everyone knows' to create pressure to conform to popular opinion without evidence.",
      severity: 'medium',
    },
    {
      name: 'Appeal to Authority',
      description: "Claims 'experts agree unanimously' without citing specific sources or allowing for dissenting views.",
      severity: 'high',
    },
    {
      name: 'Fear Mongering',
      description: "Uses 'catastrophic mistake' to evoke fear and discourage critical thinking.",
      severity: 'high',
    },
  ],
  neutral:
    'Research suggests this solution may be effective. Some experts recommend considering this approach, though perspectives vary on the potential consequences of alternative choices.',
};

// Tabs 

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
  });
});

//Analysis 

function renderTechniques(techniques) {
  const list = document.getElementById('techniques-list');
  document.getElementById('issue-count').textContent = techniques.length;
  list.innerHTML = techniques
    .map(
      (t) => `
      <div class="technique-card ${t.severity}">
        <div class="technique-header">
          <span class="technique-icon">&#9888;</span>
          <div>
            <div class="technique-name">${t.name}</div>
            <div class="technique-desc">${t.description}</div>
          </div>
        </div>
        <div class="technique-severity">${t.severity} severity</div>
      </div>`
    )
    .join('');
}

function showNeutral(text) {
  document.getElementById('neutral-text').textContent = `"${text}"`;
  document.getElementById('neutral-box').classList.remove('hidden');
  document.getElementById('generate-btn').style.display = 'none';
}

document.getElementById('generate-btn').addEventListener('click', () => {
  showNeutral(SAMPLE.neutral);
});

//Chat 

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

function getResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes('rephrase') || lower.includes('neutral')) {
    showNeutral(SAMPLE.neutral);
    return `Here's a more neutral version:\n\n"${SAMPLE.neutral}"`;
  }
  if (lower.includes('bandwagon')) {
    return "The bandwagon appeal is a logical fallacy where the argument suggests something is correct or desirable because many people believe it. It pressures you to conform based on popularity rather than evidence.";
  }
  if (lower.includes('authority')) {
    return "An appeal to authority becomes manipulative when it cites vague sources like 'experts agree' without providing specific credentials or acknowledging legitimate disagreement.";
  }
  if (lower.includes('fear') || lower.includes('mongering')) {
    return "Fear mongering uses alarming language to bypass critical thinking. 'Catastrophic mistake' pressures you to agree without evaluating the actual evidence.";
  }
  return "I can explain any of the detected techniques or rephrase the text to be more neutral. What would you like to know more about?";
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage('user', text);
  chatInput.value = '';
  setTimeout(() => addMessage('assistant', getResponse(text)), 250);
}

document.getElementById('chat-send').addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

//Settings

document.querySelectorAll('.color-swatch').forEach((swatch) => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
    swatch.classList.add('active');
  });
});


renderTechniques(SAMPLE.techniques);
