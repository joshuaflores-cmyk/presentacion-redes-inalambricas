/* ============================================================================
   INTERACTIVE DIAGRAMS & KINETIC ATTACK TELEMETRY (Slides 3, 4, 6, 7, 8)
   Respects prefers-reduced-motion, manual pause toggle, and content-visibility
   ============================================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function isPaused() {
    return document.body.classList.contains('animations-paused') || prefersReducedMotion.matches;
  }

  // ==========================================================================
  // SLIDE 3: Password Strength + Interactive Config Gates
  // ==========================================================================
  const pwBtns = document.querySelectorAll('[data-pw-mode]');
  const pwTry = document.getElementById('pw-try-text');
  const pwRate = document.getElementById('pw-rate-text');
  const pwBeam1 = document.getElementById('pw-beam-1');
  const pwBeam2 = document.getElementById('pw-beam-2');
  const pwRing = document.getElementById('pw-ring');
  const pwCore = document.getElementById('pw-core');
  const pwStatusIcon = document.getElementById('pw-status-icon');
  const pwStatusSub = document.getElementById('pw-status-sub');
  const pwTargetBox = document.getElementById('pw-target-box');
  const pwResult = document.getElementById('pw-result-text');
  const pwTime = document.getElementById('pw-time-text');

  const weakTries = ['12345678', 'password', 'admin123', '19980512', 'qwerty99'];
  let weakTick = 0;
  let pwMode = 'weak';

  setInterval(() => {
    if (pwMode === 'weak' && pwTry && !isPaused()) {
      weakTick = (weakTick + 1) % weakTries.length;
      pwTry.textContent = weakTries[weakTick];
    }
  }, 900);

  function setPasswordMode(mode) {
    pwMode = mode;
    pwBtns.forEach((b) => b.classList.toggle('is-selected', b.dataset.pwMode === mode));
    if (mode === 'weak') {
      pwTry.textContent = '12345678';
      pwRate.textContent = 'Miles de intentos/s';
      pwBeam1.setAttribute('stroke', '#f59e0b');
      pwBeam2.setAttribute('stroke', '#fb7185');
      pwBeam2.setAttribute('stroke-opacity', '1');
      pwRing.setAttribute('stroke', '#f59e0b');
      pwCore.setAttribute('stroke', '#f59e0b');
      pwStatusIcon.textContent = 'ABIERTO';
      pwStatusIcon.setAttribute('fill', '#fbbf24');
      pwStatusSub.textContent = 'Sin MFA';
      pwTargetBox.setAttribute('stroke', '#fb7185');
      pwTargetBox.setAttribute('fill', '#24101f');
      pwResult.textContent = 'COMPROMETIDA';
      pwResult.setAttribute('fill', '#fda4af');
      pwTime.textContent = 'Acceso en segundos';
    } else {
      pwTry.textContent = 'K9#v!2pQ...';
      pwRate.textContent = 'Límite + bloqueo activo';
      pwBeam1.setAttribute('stroke', '#38bdf8');
      pwBeam2.setAttribute('stroke', '#10b981');
      pwBeam2.setAttribute('stroke-opacity', '0.28');
      pwRing.setAttribute('stroke', '#10b981');
      pwCore.setAttribute('stroke', '#10b981');
      pwStatusIcon.textContent = 'BLOQUEO';
      pwStatusIcon.setAttribute('fill', '#34d399');
      pwStatusSub.textContent = 'Clave + MFA';
      pwTargetBox.setAttribute('stroke', '#10b981');
      pwTargetBox.setAttribute('fill', '#092420');
      pwResult.textContent = 'PROTEGIDA';
      pwResult.setAttribute('fill', '#6ee7b7');
      pwTime.textContent = 'Ataque detenido';
    }
  }

  pwBtns.forEach((btn) => {
    btn.addEventListener('click', () => setPasswordMode(btn.dataset.pwMode));
  });

  document.querySelectorAll('[data-gate]').forEach((gateBtn) => {
    gateBtn.addEventListener('click', () => {
      const secured = gateBtn.classList.toggle('is-secured');
      const stateEl = gateBtn.querySelector('.gate-state');
      if (stateEl) {
        stateEl.textContent = secured ? stateEl.dataset.on : stateEl.dataset.off;
      }
    });
  });

  // ==========================================================================
  // SLIDE 4: Plaintext vs WPA3 + HTTPS Encryption Tunnel + Firmware Patch
  // ==========================================================================
  const encBtns = document.querySelectorAll('[data-enc-mode]');
  const encTunnel = document.getElementById('enc-tunnel');
  const encTunnelLabel = document.getElementById('enc-tunnel-label');
  const encFlowLine = document.getElementById('enc-flow-line');
  const encPacketBg = document.getElementById('enc-packet-bg');
  const encPacketText = document.getElementById('enc-packet-text');
  const encTapLine = document.getElementById('enc-tap-line');
  const encSnifferBox = document.getElementById('enc-sniffer-box');
  const encSnifferTitle = document.getElementById('enc-sniffer-title');
  const encSnifferOut = document.getElementById('enc-sniffer-out');
  const fwBarFill = document.getElementById('fw-bar-fill');
  const fwStatusText = document.getElementById('fw-status-text');

  function setEncryptionMode(mode) {
    encBtns.forEach((b) => b.classList.toggle('is-selected', b.dataset.encMode === mode));
    if (mode === 'plain') {
      encTunnel.setAttribute('fill', 'rgba(245,158,11,0.10)');
      encTunnel.setAttribute('stroke', '#f59e0b');
      encTunnelLabel.textContent = 'CANAL EXPUESTO (TEXTO PLANO)';
      encTunnelLabel.setAttribute('fill', '#fbbf24');
      encFlowLine.setAttribute('stroke', '#f59e0b');
      encPacketBg.setAttribute('fill', '#231618');
      encPacketBg.setAttribute('stroke', '#f59e0b');
      encPacketText.textContent = 'clave=MiBanco24';
      encPacketText.setAttribute('fill', '#fde68a');
      encTapLine.setAttribute('stroke', '#fb7185');
      encTapLine.setAttribute('stroke-opacity', '1');
      encSnifferBox.setAttribute('fill', '#25101e');
      encSnifferBox.setAttribute('stroke', '#fb7185');
      encSnifferTitle.textContent = 'TERCERO INTERCEPTANDO';
      encSnifferTitle.setAttribute('fill', '#fda4af');
      encSnifferOut.textContent = 'Lee: "clave=MiBanco24"';
      fwBarFill.setAttribute('width', '46');
      fwBarFill.setAttribute('fill', '#f59e0b');
      fwStatusText.textContent = 'v1.4 · Obsoleto (CVEs)';
      fwStatusText.setAttribute('fill', '#fbbf24');
    } else {
      encTunnel.setAttribute('fill', 'rgba(16,185,129,0.12)');
      encTunnel.setAttribute('stroke', '#10b981');
      encTunnelLabel.textContent = 'TÚNEL CIFRADO (WPA3-AES + HTTPS)';
      encTunnelLabel.setAttribute('fill', '#34d399');
      encFlowLine.setAttribute('stroke', '#10b981');
      encPacketBg.setAttribute('fill', '#07241f');
      encPacketBg.setAttribute('stroke', '#10b981');
      encPacketText.textContent = '9fA#7xQ2!m8L';
      encPacketText.setAttribute('fill', '#6ee7b7');
      encTapLine.setAttribute('stroke', '#64748b');
      encTapLine.setAttribute('stroke-opacity', '0.45');
      encSnifferBox.setAttribute('fill', '#0d192b');
      encSnifferBox.setAttribute('stroke', '#475569');
      encSnifferTitle.textContent = 'INTERCEPTACIÓN BLOQUEADA';
      encSnifferTitle.setAttribute('fill', '#94a3b8');
      encSnifferOut.textContent = 'Solo ve: "9fA#7xQ2!m8L"';
      fwBarFill.setAttribute('width', '180');
      fwBarFill.setAttribute('fill', '#10b981');
      fwStatusText.textContent = 'v4.8 · Parches al día';
      fwStatusText.setAttribute('fill', '#34d399');
    }
  }

  encBtns.forEach((btn) => {
    btn.addEventListener('click', () => setEncryptionMode(btn.dataset.encMode));
  });

  // ==========================================================================
  // SLIDE 6: Interactive 4-Threat Wi-Fi Map
  // ==========================================================================
  const threatData = {
    rogue: {
      badge: 'ROGUE ACCESS POINT',
      top: 'ROGUE AP',
      main: '"WiFi_Gratis"',
      sub: 'Suplanta red oficial',
      prev: 'PREVENCIÓN: Verificar el nombre oficial y detectar puntos de acceso no autorizados.'
    },
    mitm: {
      badge: 'MAN-IN-THE-MIDDLE (MitM)',
      top: 'INTERMEDIARIO',
      main: 'Altera sesión',
      sub: 'Intercepta credenciales',
      prev: 'PREVENCIÓN: Exigir HTTPS, comprobar certificados y cifrar toda la comunicación.'
    },
    sniff: {
      badge: 'PACKET SNIFFING',
      top: 'CAPTURA RF',
      main: 'Analiza paquetes',
      sub: 'Espía tráfico sin cifrar',
      prev: 'PREVENCIÓN: Implementar cifrado fuerte (WPA3/AES) y evitar canales abiertos.'
    },
    open: {
      badge: 'RED WI-FI ABIERTA',
      top: 'SIN CONTRASEÑA',
      main: 'Acceso público',
      sub: 'Tráfico visible a todos',
      prev: 'PREVENCIÓN: No enviar datos confidenciales en redes públicas y usar cifrado.'
    }
  };

  const threatBtns = document.querySelectorAll('[data-threat]');
  threatBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.threat;
      const d = threatData[key];
      if (!d) return;
      threatBtns.forEach((b) => b.classList.toggle('is-selected', b === btn));
      document.getElementById('threat-badge-title').textContent = d.badge;
      document.getElementById('threat-mid-top').textContent = d.top;
      document.getElementById('threat-mid-main').textContent = d.main;
      document.getElementById('threat-mid-sub').textContent = d.sub;
      document.getElementById('threat-prev-text').textContent = d.prev;
    });
  });

  // ==========================================================================
  // SLIDE 8: Interactive Protocol Comparator (WEP -> WPA -> WPA2 -> WPA3)
  // ==========================================================================
  const protoData = {
    wep: {
      badge: 'WEP · OBSOLETO (NO USAR)',
      html: '<strong style="color:#f43f5e;">WEP (Wired Equivalent Privacy):</strong> uno de los primeros mecanismos Wi-Fi. Posee graves debilidades de cifrado y se vulnera fácilmente; está <strong>completamente obsoleto</strong>.'
    },
    wpa: {
      badge: 'WPA · ANTIGUO (EVITAR)',
      html: '<strong style="color:#f59e0b;">WPA (Wi-Fi Protected Access):</strong> incorporó <strong>TKIP</strong> como mejora sobre WEP, pero hoy es una tecnología antigua y no recomendada en redes nuevas.'
    },
    wpa2: {
      badge: 'WPA2 · VÁLIDO CON AES',
      html: '<strong style="color:#38bdf8;">WPA2 (AES-CCMP):</strong> estándar muy extendido y seguro si está bien configurado con AES; sigue siendo útil mientras todos los equipos migran a WPA3.'
    },
    wpa3: {
      badge: 'WPA3 · 100% RECOMENDADO',
      html: '<strong style="color:#10b981;">WPA3 (Wi-Fi Protected Access 3):</strong> incorpora autenticación <strong>SAE</strong> en redes personales y <strong>Protected Management Frames (PMF)</strong> obligatorias, dificultando ataques por diccionario y desautenticación.'
    }
  };

  const protoBtns = document.querySelectorAll('[data-proto]');
  protoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.proto;
      const d = protoData[key];
      if (!d) return;
      protoBtns.forEach((b) => b.classList.toggle('is-selected', b === btn));
      document.getElementById('proto-meter-badge').textContent = d.badge;
      document.getElementById('proto-detail-box').innerHTML = d.html;
    });
  });

  // ==========================================================================
  // SLIDE 7: Kinetic Real-Time Attacks Telemetry Canvas
  // Modern Web Guidance: efficient-background-processing (contentvisibilityautostatechange + fallback)
  // ==========================================================================
  const attackWrap = document.getElementById('kinetic-attack-wrap');
  const attackCanvas = document.getElementById('attacks-canvas');
  const attackCaption = document.getElementById('attack-caption-text');
  const btnDefense = document.getElementById('btn-toggle-defense');
  const attackTabs = document.querySelectorAll('[data-attack]');

  if (attackWrap && attackCanvas) {
    const ctx = attackCanvas.getContext('2d');
    let attackMode = 'dos';
    let defenseOn = false;
    let isCanvasVisible = false;
    let rafId = null;
    let simTime = 0;
    let lastTs = 0;

    const captions = {
      dos: {
        off: 'Saturación DoS: avalancha de paquetes e interferencia colapsan el canal Wi-Fi.',
        on: 'Defensa activa: monitoreo y filtrado de anomalías estabilizan la disponibilidad.'
      },
      deauth: {
        off: 'Deauthentication: tramas falsas expulsan dispositivos de la red inalámbrica.',
        on: 'PMF (IEEE 802.11w / WPA3) activo: las tramas de administración falsas son rechazadas.'
      },
      brute: {
        off: 'Fuerza bruta: intentos continuos contra el acceso Wi-Fi y el panel de administración.',
        on: 'Límite de intentos + bloqueo + MFA activos: el atacante queda bloqueado de inmediato.'
      }
    };

    function updateCaption() {
      attackCaption.textContent = captions[attackMode][defenseOn ? 'on' : 'off'];
      btnDefense.textContent = defenseOn ? 'Defensa activa ✓' : 'Activar defensa';
      btnDefense.classList.toggle('is-selected', defenseOn);
    }

    attackTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        attackMode = btn.dataset.attack;
        attackTabs.forEach((b) => b.classList.toggle('is-selected', b === btn));
        updateCaption();
        drawFrame();
      });
    });

    btnDefense.addEventListener('click', () => {
      defenseOn = !defenseOn;
      updateCaption();
      drawFrame();
    });

    function resizeCanvas() {
      const rect = attackWrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(300, Math.round(rect.width));
      const h = Math.max(220, Math.round(rect.height));
      if (attackCanvas.width !== w * dpr || attackCanvas.height !== h * dpr) {
        attackCanvas.width = w * dpr;
        attackCanvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    function drawFrame() {
      resizeCanvas();
      const w = attackCanvas.clientWidth || 520;
      const h = attackCanvas.clientHeight || 295;
      ctx.clearRect(0, 0, w, h);

      // Background subtle telemetry grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.09)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (attackMode === 'dos') {
        drawDoS(w, h);
      } else if (attackMode === 'deauth') {
        drawDeauth(w, h);
      } else {
        drawBruteForce(w, h);
      }
    }

    function drawDoS(w, h) {
      const padX = 28;
      const baseY = h - 54;
      const graphH = h - 115;

      // Title strip
      ctx.fillStyle = defenseOn ? '#34d399' : '#fb7185';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText(
        defenseOn ? 'ESTADO CANAL WI-FI: ESTABLE (TRÁFICO FILTRADO)' : 'ALERTA DoS: SATURACIÓN DE CANAL AL 98%',
        padX,
        28
      );

      // Animated waveform
      ctx.beginPath();
      const samples = 80;
      for (let i = 0; i <= samples; i++) {
        const x = padX + (i / samples) * (w - padX * 2);
        const phase = simTime * 3.8 + i * 0.28;
        let amp;
        if (defenseOn) {
          amp = 0.22 + Math.sin(phase) * 0.08 + Math.sin(phase * 1.9) * 0.04;
        } else {
          amp = 0.72 + Math.sin(phase * 1.4) * 0.16 + Math.cos(phase * 3.1) * 0.1;
        }
        const y = baseY - amp * graphH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = defenseOn ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Fill underneath waveform
      ctx.lineTo(w - padX, baseY);
      ctx.lineTo(padX, baseY);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, baseY - graphH, 0, baseY);
      grad.addColorStop(0, defenseOn ? 'rgba(16,185,129,0.28)' : 'rgba(244,63,94,0.34)');
      grad.addColorStop(1, 'rgba(3,7,18,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Metric pills at bottom
      const load = defenseOn ? '24%' : `${94 + Math.round(Math.sin(simTime * 5) * 4)}%`;
      const lat = defenseOn ? '14 ms' : 'TIMEOUT';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(`CARGA: ${load}`, padX, h - 20);
      ctx.fillText(`LATENCIA: ${lat}`, padX + 140, h - 20);
      ctx.fillStyle = defenseOn ? '#34d399' : '#fda4af';
      ctx.fillText(defenseOn ? 'SERVICIO DISPONIBLE' : 'CAÍDA DE DISPONIBILIDAD', w - padX - 165, h - 20);
    }

    function drawDeauth(w, h) {
      const cy = h * 0.52;
      const apX = w * 0.2;
      const clientX = w * 0.8;
      const midX = w * 0.5;

      ctx.fillStyle = defenseOn ? '#34d399' : '#fb7185';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText(
        defenseOn ? 'PMF (802.11w / WPA3): TRAMAS DE GESTIÓN AUTENTICADAS' : 'ATAQUE DEAUTH: SUPLANTANDO TRAMAS DE DESCONEXIÓN',
        26,
        28
      );

      // Link line between AP and Client
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -simTime * 42;
      ctx.strokeStyle = defenseOn ? '#10b981' : 'rgba(244,63,94,0.35)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(apX + 36, cy);
      ctx.lineTo(clientX - 36, cy);
      ctx.stroke();
      ctx.restore();

      // Attacker sending spoofed deauth frames from top
      const atkY = 66;
      const p = (simTime * 0.9) % 1;
      const frameY = atkY + 24 + p * (cy - atkY - 38);

      ctx.fillStyle = '#290d1b';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(midX - 66, atkY - 18, 132, 34, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fda4af';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TRAMA DEAUTH FALSA', midX, atkY + 3);

      // Falling spoofed pulse
      const stopY = defenseOn ? cy - 30 : frameY;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(midX, Math.min(frameY, stopY), 6, 0, Math.PI * 2);
      ctx.fill();

      // PMF Shield barrier if defense active
      if (defenseOn) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(midX, cy, 34, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.fillText('ESCUDO PMF', midX, cy - 38);
      } else {
        // Broken connection X mark
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(midX - 12, cy - 12);
        ctx.lineTo(midX + 12, cy + 12);
        ctx.moveTo(midX + 12, cy - 12);
        ctx.lineTo(midX - 12, cy + 12);
        ctx.stroke();
      }

      // AP and Client Nodes
      [
        { x: apX, title: 'Punto de Acceso', sub: 'Router Wi-Fi', col: '#38bdf8' },
        { x: clientX, title: 'Dispositivo', sub: defenseOn ? 'Conectado ✓' : 'Desconectado ✕', col: defenseOn ? '#10b981' : '#fb7185' }
      ].forEach((n) => {
        ctx.fillStyle = '#0c1b33';
        ctx.strokeStyle = n.col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(n.x - 54, cy - 30, 108, 60, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(n.title, n.x, cy - 4);
        ctx.fillStyle = n.col;
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText(n.sub, n.x, cy + 15);
      });
      ctx.textAlign = 'left';
    }

    function drawBruteForce(w, h) {
      const pad = 26;
      ctx.fillStyle = defenseOn ? '#34d399' : '#f59e0b';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText(
        defenseOn ? 'DEFENSA ACTIVA: BLOQUEO TRAS 5 INTENTOS + MFA' : 'FUERZA BRUTA: PROBANDO COMBINACIONES SIN LÍMITE',
        pad,
        28
      );

      const attemptCount = defenseOn ? 5 : Math.floor(simTime * 1450) % 99999;
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 28px "JetBrains Mono", monospace';
      ctx.fillText(String(attemptCount).padStart(5, '0'), pad, 82);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('combinaciones probadas', pad, 102);

      // Animated combination bars
      const keys = ['admin2024', 'wifi12345', 'empresa01', 'clave2026', 'qwerty789', 'acceso999'];
      keys.forEach((k, idx) => {
        const y = 128 + idx * 24;
        const active = !defenseOn && Math.floor(simTime * 8) % keys.length === idx;
        ctx.fillStyle = active ? 'rgba(244,63,94,0.22)' : 'rgba(15,25,48,0.7)';
        ctx.beginPath();
        ctx.roundRect(pad, y, w - pad * 2, 18, 5);
        ctx.fill();

        ctx.fillStyle = active ? '#fda4af' : '#94a3b8';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText(`TRY >> ${k}`, pad + 10, y + 12.5);

        ctx.fillStyle = defenseOn ? '#34d399' : (active ? '#fbbf24' : '#64748b');
        ctx.textAlign = 'right';
        ctx.fillText(defenseOn ? 'IP BLOQUEADA · MFA' : (active ? 'PROBANDO...' : 'FALLIDO'), w - pad - 10, y + 12.5);
        ctx.textAlign = 'left';
      });
    }

    function tick(ts) {
      if (!isCanvasVisible || isPaused()) {
        rafId = null;
        return;
      }
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      simTime += dt;
      drawFrame();
      rafId = requestAnimationFrame(tick);
    }

    function startSim() {
      isCanvasVisible = true;
      lastTs = 0;
      drawFrame();
      if (!rafId && !isPaused()) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function stopSim() {
      isCanvasVisible = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    // Modern Web Guidance: contentvisibilityautostatechange directly on element with content-visibility: auto
    if ('contentVisibility' in document.documentElement.style && 'oncontentvisibilityautostatechange' in HTMLElement.prototype) {
      attackWrap.addEventListener('contentvisibilityautostatechange', (event) => {
        if (event.skipped) stopSim();
        else startSim();
      });
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting ? startSim() : stopSim()));
        },
        { rootMargin: '200px' }
      );
      io.observe(attackWrap);
    }

    // React to global pause toggle
    document.addEventListener('deck:pausechange', () => {
      if (isPaused()) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        drawFrame();
      } else if (isCanvasVisible && !rafId) {
        lastTs = 0;
        rafId = requestAnimationFrame(tick);
      }
    });

    window.addEventListener('resize', drawFrame);
    updateCaption();
    drawFrame();
  }
})();
