// TechMasters page JS: dark mode toggle, chat sandbox simulation
(function(){
  // Elements
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const chatForm = document.getElementById('chatForm');
  const messages = document.getElementById('messages');
  const promptInput = document.getElementById('prompt');
  const sampleBtn = document.getElementById('sampleBtn');

  // Initialize theme from localStorage
  const saved = localStorage.getItem('tm_theme');
  if(saved === 'light') body.classList.remove('dark');
  else body.classList.add('dark');

  // Toggle theme
  function updateThemeIcon(){
    const icon = themeToggle.querySelector('i');
    if(body.classList.contains('dark')) icon.setAttribute('data-lucide','sun');
    else icon.setAttribute('data-lucide','moon');
    lucide.createIcons();
  }

  themeToggle.addEventListener('click', ()=>{
    body.classList.toggle('dark');
    localStorage.setItem('tm_theme', body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  });
  updateThemeIcon();

  // Chat helpers
  function appendMessage(text, who){
    const el = document.createElement('div');
    el.className = 'msg ' + (who === 'user' ? 'user' : 'ai');
    el.innerHTML = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function simulateAIReply(userText){
    // small simulated thinking delay
    appendMessage('Typing…', 'ai');
    setTimeout(()=>{
      // remove the 'Typing…' bubble
      const last = messages.querySelector('.msg.ai:last-child');
      if(last && last.textContent.trim() === 'Typing…') last.remove();

      // Provide a canned answer for the example question; otherwise fall back to a short templated reply
      const q = userText.toLowerCase();
      let reply = '';
      if(q.includes('choose between') && q.includes('certificate') ){
        reply = "The <strong>National Diploma</strong> offers a deep, 12-18 month dive for career changers, focusing on high-level skills like MLOps. A <strong>Professional Certificate</strong> is 3-9 months, ideal for upskilling in specific areas like Prompt Engineering or Cybersecurity.";
      } else if(q.length < 6){
        reply = 'Could you provide a bit more detail so the AI-TA can give tailored guidance?';
      } else {
        reply = 'Great question — the AI-TA suggests reviewing your goals: depth vs speed, career pivot vs upskill, and time available. For detailed course matches, check the program pages above.';
      }
      appendMessage(reply, 'ai');
    }, 900 + Math.random()*800);
  }

  // Form submit -> add user bubble + simulated AI bubble
  chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const val = promptInput.value && promptInput.value.trim();
    if(!val) return;
    appendMessage(val, 'user');
    promptInput.value = '';
    simulateAIReply(val);
  });

  // Sample button triggers the example simulated conversation
  sampleBtn.addEventListener('click', ()=>{
    const question = 'How do I choose between a Certificate and a Diploma?';
    appendMessage(question, 'user');
    setTimeout(()=> simulateAIReply(question), 300);
  });

  // Small UX: send message on Enter
  promptInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
    }
  });

})();
