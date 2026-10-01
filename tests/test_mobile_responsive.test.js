import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Responsive Defaults and Markup Verification', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf-8');
  const styleCss = fs.readFileSync('src/style.css', 'utf-8');
  const appJs = fs.readFileSync('src/app.js', 'utf-8');
  const videoGridJs = fs.readFileSync('src/videoGrid.js', 'utf-8');

  // 1. Verificação da velocidade padrão 1.0x (Normal)
  assert.ok(indexHtml.includes('<option value="1.0" selected>1.00x (Normal)</option>'), 'HTML deve ter 1.0x como selected');
  assert.ok(appJs.includes('let playbackRate = 1.0;'), 'app.js deve ter playbackRate padrão 1.0');
  assert.ok(videoGridJs.includes('this.playbackRate = 1.0;'), 'videoGrid.js deve ter playbackRate padrão 1.0');

  // 2. Verificação de layout padrão em Desktop (1x2 com fundamentos aberto)
  assert.ok(indexHtml.includes('id="layout-1x2" class="btn-toggle active"'), 'HTML deve ter 1x2 ativo por padrão');
  assert.ok(appJs.includes('currentLayout = "grid-1x2";'), 'app.js deve definir 1x2 no desktop');
  assert.ok(appJs.includes("pedagogyPanelEl.classList.remove('collapsed');"), 'app.js deve abrir fundamentos no desktop');
  assert.ok(appJs.includes("btnTogglePedagogy.classList.add('active');"), 'app.js deve ativar botão fundamentos no desktop');

  // 3. Verificação de layout em Mobile (1x1 com fundamentos recolhido)
  assert.ok(appJs.includes('const isMobile = window.innerWidth <= 768;'), 'app.js deve checar breakpoint de 768px');
  assert.ok(appJs.includes('currentLayout = "grid-1x1";'), 'app.js deve definir 1x1 no mobile');
  assert.ok(appJs.includes("pedagogyPanelEl.classList.add('collapsed');"), 'app.js deve recolher fundamentos no mobile');
  assert.ok(appJs.includes("btnTogglePedagogy.classList.remove('active');"), 'app.js deve desativar botão fundamentos no mobile');

  // 4. Verificação das regras de estilo CSS mobile (<= 768px)
  assert.ok(styleCss.includes('@media (max-width: 768px)'), 'style.css deve conter media query de 768px');
  assert.ok(styleCss.includes('.layout-group {'), 'style.css deve ocultar grupo de grade no mobile');
  assert.ok(styleCss.includes('display: none !important;'), 'style.css deve ter display none para layout group');
  assert.ok(styleCss.includes('.master-timeline-bar {'), 'style.css deve formatar rodapé mobile');
  assert.ok(styleCss.includes('flex-direction: column;'), 'style.css deve usar coluna no rodapé mobile');
  assert.ok(styleCss.includes('100dvh'), 'style.css deve suportar dynamic viewport height mobile');

  // 5. Verificação dos badges de quadrante amigáveis
  assert.ok(videoGridJs.includes('Vídeo Principal'), 'videoGrid deve ter badge Vídeo Principal para 1x1');
  assert.ok(videoGridJs.includes('Vídeo 1 (Esquerda)'), 'videoGrid deve ter badge Vídeo 1 (Esquerda) para 1x2');
  assert.ok(videoGridJs.includes('Vídeo 2 (Direita)'), 'videoGrid deve ter badge Vídeo 2 (Direita) para 1x2');
});
