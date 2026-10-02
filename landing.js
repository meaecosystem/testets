// landing.js
// 1) Dropdown header (akun & bahasa) — logic disalin dari landing.js
//    MEA Ecosystem supaya perilakunya identik.
// 2) Chat box Siesta — demo/dummy rule-based (BUKAN AI asli), biar
//    bisa langsung dicoba tanpa akun dulu sebelum mesin AI beneran
//    kesambung. Enforcement limit beneran nanti di backend.

(function () {
  'use strict';

  /* ----------------------------------------------------------
     LANGUAGE DROPDOWN — visual aja dulu, belum ada i18n Siesta,
     jadi klik cuma nutup dropdown, nggak navigasi kemana-mana.
     ---------------------------------------------------------- */
  var langMenu = document.getElementById('langMenu');
  var langTrigger = document.getElementById('langTrigger');
  if (langMenu && langTrigger) {
    langTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      langMenu.classList.toggle('open');
    });
    langMenu.querySelectorAll('.lang-dropdown a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); // belum ada halaman bahasa lain — placeholder
        langMenu.classList.remove('open');
      });
    });
    document.addEventListener('click', function () { langMenu.classList.remove('open'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') langMenu.classList.remove('open');
    });
  }

  /* ----------------------------------------------------------
     ACCOUNT DROPDOWN
     ---------------------------------------------------------- */
  var accountMenu = document.getElementById('accountMenu');
  var accountTrigger = document.getElementById('accountTrigger');
  if (accountMenu && accountTrigger) {
    accountTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      accountMenu.classList.toggle('open');
    });
    document.addEventListener('click', function () { accountMenu.classList.remove('open'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') accountMenu.classList.remove('open');
    });
  }

  /* ----------------------------------------------------------
     CHAT — demo/dummy rule-based
     ---------------------------------------------------------- */
  var DAILY_LIMIT = 5;
  var LOGIN_URL = 'https://meaecosystem.com/auth/login/?next=https://siesta.meaecosystem.com/room/chat/';

  var today = new Date().toISOString().slice(0, 10);
  var stored = JSON.parse(localStorage.getItem('siesta_usage') || '{}');
  if (stored.date !== today) stored = { date: today, count: 0 };

  var limitText = document.getElementById('limitText');
  function renderLimit() {
    var left = Math.max(DAILY_LIMIT - stored.count, 0);
    limitText.textContent = left > 0
      ? left + ' pesan gratis tersisa hari ini'
      : 'Limit gratis hari ini habis';
  }
  renderLimit();

  // Daftar aturan sederhana — cocokkan kata kunci, kalau nggak ada
  // yang cocok pakai fallback. Ini SEMUA dummy, bukan model AI.
  var RULES = [
    { match: /\b(halo|hai|hi|hey|pagi|siang|sore|malam)\b/i,
      reply: 'Halo! Aku Siesta, asisten AI dari MEA Ecosystem. Versi ini masih demo — jawabannya belum dari model AI beneran, cuma rule-based dulu.' },
    { match: /siapa (kamu|kau)|kamu siapa|apa itu siesta/i,
      reply: 'Aku Siesta, asisten AI dari MEA Ecosystem. Sekarang masih mode demo, belum tersambung ke model AI aslinya.' },
    { match: /nama( kamu)?/i,
      reply: 'Namaku Siesta.' },
    { match: /(makasih|terima kasih|thanks)/i,
      reply: 'Sama-sama! Ada lagi yang mau ditanya?' },
    { match: /(apa kabar|gimana kabar)/i,
      reply: 'Baik! Masih demo sih, tapi siap dicoba.' }
  ];
  var FALLBACK = 'Ini masih jawaban demo ya — belum tersambung ke model AI beneran. Tapi alur & tampilannya udah kayak gini nantinya.';

  function pickReply(text) {
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].match.test(text)) return RULES[i].reply;
    }
    return FALLBACK;
  }

  var chatLog = document.getElementById('chatLog');
  function addBubble(role, text) {
    var el = document.createElement('div');
    el.className = 'chat-bubble ' + role;
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  var input = document.getElementById('chatInput');
  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('chatBox').requestSubmit();
    }
  });

  document.getElementById('chatBox').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;

    // Limit abis → kasih tau di chat, bukan langsung tendang ke login
    if (stored.count >= DAILY_LIMIT) {
      addBubble('user', text);
      input.value = '';
      input.style.height = 'auto';
      var el = document.createElement('div');
      el.className = 'chat-bubble assistant';
      el.innerHTML = 'Limit gratis hari ini udah habis. <a href="' + LOGIN_URL + '" style="color:var(--accent-2);text-decoration:underline;">Masuk</a> buat lanjut ngobrol dengan limit lebih besar.';
      chatLog.appendChild(el);
      chatLog.scrollTop = chatLog.scrollHeight;
      return;
    }

    addBubble('user', text);
    input.value = '';
    input.style.height = 'auto';

    stored.count += 1;
    localStorage.setItem('siesta_usage', JSON.stringify(stored));
    renderLimit();

    // Jeda kecil biar kerasa "mikir", bukan instan
    setTimeout(function () {
      addBubble('assistant', pickReply(text));
    }, 400);
  });
})();
