// landing.js
// Logic landing Siesta: counter limit harian (kosmetik, client-side),
// auto-grow textarea, dan submit chat box.
// Load order: landing.js di-load setelah DOM (taruh sebelum </body>).

(function () {
  'use strict';

  // ── Limit harian ────────────────────────────────────────────
  // Angka ini placeholder — ganti DAILY_LIMIT kalau sudah fix.
  // Enforcement beneran nanti di backend /room/chat/, ini cuma
  // nampilin sisa limit di landing supaya user ada gambaran.
  var DAILY_LIMIT = 5;
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

  // ── Textarea auto-grow ──────────────────────────────────────
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

  // ── Submit: halaman /room/chat/ belum ada — ini cuma jembatan,
  //    bawa pesan pertama via query param supaya nggak hilang
  //    begitu ruang chat-nya beneran dibangun. ──────────────────
  document.getElementById('chatBox').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;

    if (stored.count >= DAILY_LIMIT) {
      window.location.href = 'https://meaecosystem.com/auth/login/?next=https://siesta.meaecosystem.com/room/chat/';
      return;
    }

    stored.count += 1;
    localStorage.setItem('siesta_usage', JSON.stringify(stored));
    renderLimit();

    window.location.href = '/room/chat/?q=' + encodeURIComponent(text);
  });
})();
