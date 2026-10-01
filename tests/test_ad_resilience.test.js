import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('YouTube Ads Resilience & Quick Resync Verification', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf-8');
  const styleCss = fs.readFileSync('src/style.css', 'utf-8');
  const appJs = fs.readFileSync('src/app.js', 'utf-8');
  const videoGridJs = fs.readFileSync('src/videoGrid.js', 'utf-8');
  const userGuideJs = fs.readFileSync('src/userGuide.js', 'utf-8');

  // 1. Botão Mestre de Ressincronização Rápida no HTML
  assert.ok(indexHtml.includes('id="btn-quick-resync"'), 'HTML deve conter botão #btn-quick-resync');
  assert.ok(indexHtml.includes('class="btn-icon-action btn-resync"'), 'Botão deve ter classes btn-icon-action btn-resync');
  assert.ok(indexHtml.includes('Sincronizar'), 'Botão deve exibir texto Sincronizar');

  // 2. Detecção e Mitigação de Anúncios no videoGrid.js
  assert.ok(videoGridJs.includes('hasActiveAd()'), 'videoGrid deve ter método hasActiveAd()');
  assert.ok(videoGridJs.includes('resyncSlot(slotIndex)'), 'videoGrid deve ter método resyncSlot');
  assert.ok(videoGridJs.includes('ad-notice-badge'), 'videoGrid deve renderizar badge de anúncio do YouTube');
  assert.ok(videoGridJs.includes('btn-resync-slot'), 'videoGrid deve renderizar botão de ressincronia individual no card');

  // 3. Orquestração do Relógio Mestre no app.js
  assert.ok(appJs.includes('gridManager.hasActiveAd()'), 'app.js deve checar se anúncio está ativo');
  assert.ok(appJs.includes('btn-quick-resync'), 'app.js deve vincular evento ao botão btn-quick-resync');
  assert.ok(appJs.includes('gridManager.seekAll'), 'app.js deve chamar seekAll na ressincronização');

  // 4. Estilos CSS para Ressincronia e Badge de Anúncio
  assert.ok(styleCss.includes('.btn-resync'), 'style.css deve conter estilos de .btn-resync');
  assert.ok(styleCss.includes('.btn-resync-slot'), 'style.css deve conter estilos de .btn-resync-slot');
  assert.ok(styleCss.includes('.ad-notice-badge'), 'style.css deve conter estilos de .ad-notice-badge');
  assert.ok(styleCss.includes('@keyframes pulseAd'), 'style.css deve conter animação pulseAd');
  assert.ok(styleCss.includes('#btn-quick-resync'), 'style.css mobile deve incluir #btn-quick-resync');

  // 5. Orientações no Guia do Usuário
  assert.ok(userGuideJs.includes('Ressincronização Rápida'), 'Guia de uso deve conter tópico de Ressincronização Rápida');
  assert.ok(userGuideJs.includes('YouTube Premium'), 'Guia de uso deve orientar sobre contas sem YouTube Premium');
});
