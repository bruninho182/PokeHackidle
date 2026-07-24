// ===== ELEMENTOS =====
const toggleAutoClick = document.getElementById('toggleAutoClick');
const toggleNotifyLendaria = document.getElementById('toggleNotifyLendaria');
const toggleNotifyEpica = document.getElementById('toggleNotifyEpica');
const toggleNotifyRara = document.getElementById('toggleNotifyRara');
const toggleAlertaIV = document.getElementById('toggleAlertaIV');
const toggleIVLendaria = document.getElementById('toggleIVLendaria');
const toggleIVEpica = document.getElementById('toggleIVEpica');
const toggleIVRara = document.getElementById('toggleIVRara');
const toggleAlertaDrop = document.getElementById('toggleAlertaDrop');
const toggleRotacao = document.getElementById('toggleRotacao');
const speedSlider = document.getElementById('speedSlider');
const speedInput = document.getElementById('speedInput');
const speedDisplay = document.getElementById('speedDisplay');
const ivMinSlider = document.getElementById('ivMinSlider');
const ivMinInput = document.getElementById('ivMinInput');
const ivMinDisplay = document.getElementById('ivMinDisplay');
const dropItensInput = document.getElementById('dropItensInput');
const secAlertaIV = document.getElementById('secAlertaIV');
const secAlertaDrop = document.getElementById('secAlertaDrop');
const secRotacao = document.getElementById('secRotacao');
const tempoAreaInput = document.getElementById('tempoAreaInput');
const listaAreas = document.getElementById('listaAreas');
const btnCapturarArea = document.getElementById('btnCapturarArea');
const btnIniciarRotacao = document.getElementById('btnIniciarRotacao');
const btnAbrirDashboard = document.getElementById('btnAbrirDashboard');
const countLendaria = document.getElementById('countLendaria');
const countEpica = document.getElementById('countEpica');
const countRara = document.getElementById('countRara');
const countTotal = document.getElementById('countTotal');
const resetBtn = document.getElementById('resetStats');
const ultimaNome = document.getElementById('ultimaNome');
const ultimaRaridade = document.getElementById('ultimaRaridade');
const ultimaIV = document.getElementById('ultimaIV');
const ultimaBola = document.getElementById('ultimaBola');
const ultimaHora = document.getElementById('ultimaHora');
const ultimaLevel = document.getElementById('ultimaLevel');
const ultimaImagem = document.getElementById('ultimaImagem');
const ultimaPlaceholder = document.getElementById('ultimaPlaceholder');
const historicoLista = document.getElementById('historicoLista');

// ===== POKÉAPI =====
const cacheImagens = {};
const pokedexNumeros = {
  'bulbasaur':1,'ivysaur':2,'venusaur':3,'charmander':4,'charmeleon':5,'charizard':6,'squirtle':7,'wartortle':8,'blastoise':9,
  'caterpie':10,'metapod':11,'butterfree':12,'weedle':13,'kakuna':14,'beedrill':15,'pidgey':16,'pidgeotto':17,'pidgeot':18,
  'rattata':19,'raticate':20,'spearow':21,'fearow':22,'ekans':23,'arbok':24,'pikachu':25,'raichu':26,'sandshrew':27,'sandslash':28,
  'nidoran female':29,'nidorina':30,'nidoqueen':31,'nidoran male':32,'nidorino':33,'nidoking':34,'clefairy':35,'clefable':36,
  'vulpix':37,'ninetales':38,'jigglypuff':39,'wigglytuff':40,'zubat':41,'golbat':42,'oddish':43,'gloom':44,'vileplume':45,
  'paras':46,'parasect':47,'venonat':48,'venomoth':49,'diglett':50,'dugtrio':51,'meowth':52,'persian':53,'psyduck':54,'golduck':55,
  'mankey':56,'primeape':57,'growlithe':58,'arcanine':59,'poliwag':60,'poliwhirl':61,'poliwrath':62,'abra':63,'kadabra':64,
  'alakazam':65,'machop':66,'machoke':67,'machamp':68,'bellsprout':69,'weepinbell':70,'victreebel':71,'tentacool':72,
  'tentacruel':73,'geodude':74,'graveler':75,'golem':76,'ponyta':77,'rapidash':78,'slowpoke':79,'slowbro':80,'magnemite':81,
  'magneton':82,'farfetchd':83,'doduo':84,'dodrio':85,'seel':86,'dewgong':87,'grimer':88,'muk':89,'shellder':90,'cloyster':91,
  'gastly':92,'haunter':93,'gengar':94,'onix':95,'drowzee':96,'hypno':97,'krabby':98,'kingler':99,'voltorb':100,'electrode':101,
  'exeggcute':102,'exeggutor':103,'cubone':104,'marowak':105,'hitmonlee':106,'hitmonchan':107,'lickitung':108,'koffing':109,
  'weezing':110,'rhyhorn':111,'rhydon':112,'chansey':113,'tangela':114,'kangaskhan':115,'horsea':116,'seadra':117,'goldeen':118,
  'seaking':119,'staryu':120,'starmie':121,'mr. mime':122,'scyther':123,'jynx':124,'electabuzz':125,'magmar':126,'pinsir':127,
  'tauros':128,'magikarp':129,'gyarados':130,'lapras':131,'ditto':132,'eevee':133,'vaporeon':134,'jolteon':135,'flareon':136,
  'porygon':137,'omanyte':138,'omastar':139,'kabuto':140,'kabutops':141,'aerodactyl':142,'snorlax':143,'articuno':144,'zapdos':145,
  'moltres':146,'dratini':147,'dragonair':148,'dragonite':149,'mewtwo':150,'mew':151
};

async function buscarImagemPokemon(nome){
  if(!nome||nome==='---')return null;
  let n=nome.toLowerCase().trim();if(n.startsWith('shiny '))n=n.replace('shiny ','');
  if(cacheImagens[n]!==undefined)return cacheImagens[n];
  const num=pokedexNumeros[n];
  if(num){try{const r=await fetch(`https://pokeapi.co/api/v2/pokemon/${num}`);if(r.ok){const d=await r.json();const i=d.sprites.other['official-artwork'].front_default||d.sprites.front_default;if(i){cacheImagens[n]=i;return i;}}}catch(e){}}
  cacheImagens[n]=null;return null;
}

async function atualizarImagemPokemon(nome){
  if(!ultimaImagem||!ultimaPlaceholder)return;
  if(!nome||nome==='---'){ultimaImagem.style.display='none';ultimaPlaceholder.style.display='flex';return;}
  const img=await buscarImagemPokemon(nome);
  if(img){ultimaImagem.src=img;ultimaImagem.style.display='block';ultimaPlaceholder.style.display='none';}
  else{ultimaImagem.style.display='none';ultimaPlaceholder.style.display='flex';}
}

function carregarDashboard(){
  chrome.storage.local.get(['ultimaCaptura','historico'],(data)=>{
    if(data.ultimaCaptura){const u=data.ultimaCaptura;
      if(ultimaNome)ultimaNome.textContent=u.nome||'---';
      if(ultimaRaridade){ultimaRaridade.textContent=u.raridade||'---';ultimaRaridade.className='valor-raridade';
        if(u.raridade==='Lendária')ultimaRaridade.classList.add('cor-lendario');
        else if(u.raridade==='Épica')ultimaRaridade.classList.add('cor-epico');
        else if(u.raridade==='Rara')ultimaRaridade.classList.add('cor-raro');}
      if(ultimaIV)ultimaIV.textContent=u.iv||'---';if(ultimaBola)ultimaBola.textContent=u.bola||'---';if(ultimaHora)ultimaHora.textContent=u.horario||'---';if(ultimaLevel)ultimaLevel.textContent='Lv.'+(u.level||'?');
      atualizarImagemPokemon(u.nome);}
    if(!historicoLista)return;const h=data.historico||[];historicoLista.innerHTML='';
    if(h.length===0){historicoLista.innerHTML='<div class="historico-vazio">Nenhuma captura ainda</div>';return;}
    h.slice(0,4).forEach(item=>{const d=document.createElement('div');d.className='historico-item';let rc='';
      if(item.raridade==='Lendária')rc='cor-lendario';else if(item.raridade==='Épica')rc='cor-epico';else if(item.raridade==='Rara')rc='cor-raro';
      d.innerHTML=`<span class="hist-nome">${item.nome}</span><span class="hist-raridade ${rc}">${item.raridade}</span><span class="hist-iv">IV ${item.iv}</span><span class="hist-hora">${item.horario}</span>`;historicoLista.appendChild(d);});
  });
}

function carregarEstatisticas(){
  chrome.runtime.sendMessage({type:'getStats'},(c)=>{if(c){if(countLendaria)countLendaria.textContent=c.lendaria||0;if(countEpica)countEpica.textContent=c.epica||0;if(countRara)countRara.textContent=c.rara||0;if(countTotal)countTotal.textContent=c.total||0;}});
}

function carregarListaAreas(){
  chrome.storage.local.get(['areasRotacao'],(d)=>{
    const areas = d.areasRotacao || [];
    if(listaAreas){
      listaAreas.innerHTML = areas.map((a,i)=>`<div class="area-item"><span>${a.nome||'Área '+(i+1)}</span><button data-index="${i}" class="remover-area">✕</button></div>`).join('');
      document.querySelectorAll('.remover-area').forEach(btn=>{
        btn.addEventListener('click',(e)=>{
          const idx = parseInt(e.target.dataset.index);
          areas.splice(idx,1);
          chrome.storage.local.set({areasRotacao:areas},carregarListaAreas);
        });
      });
    }
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.areasRotacao) {
    carregarListaAreas();
  }
});

document.addEventListener('DOMContentLoaded',()=>{
  chrome.storage.local.get(['autoClickEnabled','notifyLendariaEnabled','notifyEpicaEnabled','notifyRaraEnabled','clickSpeed','alertaIVEnabled','ivMinimo','ivLendariaEnabled','ivEpicaEnabled','ivRaraEnabled','alertaDropEnabled','dropItens','rotacaoAtiva','tempoArea','areasRotacao'],(data)=>{
    if(toggleAutoClick)toggleAutoClick.checked=data.autoClickEnabled!==false;
    if(toggleNotifyLendaria)toggleNotifyLendaria.checked=data.notifyLendariaEnabled!==false;
    if(toggleNotifyEpica)toggleNotifyEpica.checked=data.notifyEpicaEnabled!==false;
    if(toggleNotifyRara)toggleNotifyRara.checked=data.notifyRaraEnabled!==false;
    if(toggleAlertaIV){toggleAlertaIV.checked=data.alertaIVEnabled===true;if(secAlertaIV)secAlertaIV.style.display=data.alertaIVEnabled?'block':'none';}
    if(toggleIVLendaria)toggleIVLendaria.checked=data.ivLendariaEnabled!==false;
    if(toggleIVEpica)toggleIVEpica.checked=data.ivEpicaEnabled!==false;
    if(toggleIVRara)toggleIVRara.checked=data.ivRaraEnabled!==false;
    if(toggleAlertaDrop){toggleAlertaDrop.checked=data.alertaDropEnabled===true;if(secAlertaDrop)secAlertaDrop.style.display=data.alertaDropEnabled?'block':'none';}
    if(toggleRotacao){toggleRotacao.checked=data.rotacaoAtiva===true;if(secRotacao)secRotacao.style.display=data.rotacaoAtiva?'block':'none';}
    if(ivMinSlider)ivMinSlider.value=data.ivMinimo||150;
    if(ivMinInput)ivMinInput.value=data.ivMinimo||150;
    if(ivMinDisplay)ivMinDisplay.textContent=data.ivMinimo||150;
    if(dropItensInput)dropItensInput.value=data.dropItens||'';
    if(tempoAreaInput)tempoAreaInput.value=data.tempoArea||4;
    const s=data.clickSpeed||1000;
    if(speedSlider)speedSlider.value=s;
    if(speedInput)speedInput.value=s;
    if(speedDisplay)speedDisplay.textContent=s+' ms';
    carregarListaAreas();
  });
  carregarEstatisticas();carregarDashboard();
});

// ===== EVENT LISTENERS =====
if(toggleAutoClick)toggleAutoClick.addEventListener('change',()=>chrome.storage.local.set({autoClickEnabled:toggleAutoClick.checked}));

if(speedSlider&&speedInput){
  speedSlider.addEventListener('input',()=>{speedInput.value=speedSlider.value;if(speedDisplay)speedDisplay.textContent=speedSlider.value+' ms';});
  speedSlider.addEventListener('change',()=>chrome.storage.local.set({clickSpeed:parseInt(speedSlider.value)}));
  speedInput.addEventListener('input',()=>{let v=parseInt(speedInput.value);if(isNaN(v))v=1000;if(v<500)v=500;if(v>5000)v=5000;speedSlider.value=v;if(speedDisplay)speedDisplay.textContent=v+' ms';});
  speedInput.addEventListener('change',()=>{let v=parseInt(speedInput.value);if(isNaN(v))v=1000;if(v<500)v=500;if(v>5000)v=5000;speedInput.value=v;chrome.storage.local.set({clickSpeed:v});});
}

if(toggleNotifyLendaria)toggleNotifyLendaria.addEventListener('change',()=>chrome.storage.local.set({notifyLendariaEnabled:toggleNotifyLendaria.checked}));
if(toggleNotifyEpica)toggleNotifyEpica.addEventListener('change',()=>chrome.storage.local.set({notifyEpicaEnabled:toggleNotifyEpica.checked}));
if(toggleNotifyRara)toggleNotifyRara.addEventListener('change',()=>chrome.storage.local.set({notifyRaraEnabled:toggleNotifyRara.checked}));

if(toggleAlertaIV){toggleAlertaIV.addEventListener('change',()=>{chrome.storage.local.set({alertaIVEnabled:toggleAlertaIV.checked});if(secAlertaIV)secAlertaIV.style.display=toggleAlertaIV.checked?'block':'none';});}
if(toggleIVLendaria)toggleIVLendaria.addEventListener('change',()=>chrome.storage.local.set({ivLendariaEnabled:toggleIVLendaria.checked}));
if(toggleIVEpica)toggleIVEpica.addEventListener('change',()=>chrome.storage.local.set({ivEpicaEnabled:toggleIVEpica.checked}));
if(toggleIVRara)toggleIVRara.addEventListener('change',()=>chrome.storage.local.set({ivRaraEnabled:toggleIVRara.checked}));

if(toggleAlertaDrop){toggleAlertaDrop.addEventListener('change',()=>{chrome.storage.local.set({alertaDropEnabled:toggleAlertaDrop.checked});if(secAlertaDrop)secAlertaDrop.style.display=toggleAlertaDrop.checked?'block':'none';});}
if(dropItensInput){dropItensInput.addEventListener('input',()=>chrome.storage.local.set({dropItens:dropItensInput.value}));}

if(toggleRotacao){toggleRotacao.addEventListener('change',()=>{chrome.storage.local.set({rotacaoAtiva:toggleRotacao.checked});if(secRotacao)secRotacao.style.display=toggleRotacao.checked?'block':'none';});}
if(tempoAreaInput){tempoAreaInput.addEventListener('change',()=>chrome.storage.local.set({tempoArea:parseInt(tempoAreaInput.value)||4}));}

if(btnCapturarArea){
  btnCapturarArea.addEventListener('click', () => {
    chrome.storage.local.set({ capturarProximaArea: true }, () => {
      alert('Modo captura ativado! Abra o mapa e clique nas áreas desejadas. Quando terminar, clique em "Iniciar Rotação".');
    });
  });
}

if(btnIniciarRotacao){
  btnIniciarRotacao.addEventListener('click', () => {
    chrome.storage.local.set({ capturarProximaArea: false, rotacaoAtiva: true }, () => {
      if (toggleRotacao) toggleRotacao.checked = true;
      if (secRotacao) secRotacao.style.display = 'block';
      alert('Rotação iniciada!');
    });
  });
}

// Abrir Dashboard
if(btnAbrirDashboard){
  btnAbrirDashboard.addEventListener('click', () => {
    chrome.windows.create({
      url: chrome.runtime.getURL('dashboard.html'),
      type: 'popup',
      width: 500,
      height: 700
    });
  });
}

if(ivMinSlider&&ivMinInput){
  ivMinSlider.addEventListener('input',()=>{ivMinInput.value=ivMinSlider.value;if(ivMinDisplay)ivMinDisplay.textContent=ivMinSlider.value;});
  ivMinSlider.addEventListener('change',()=>chrome.storage.local.set({ivMinimo:parseInt(ivMinSlider.value)}));
  ivMinInput.addEventListener('input',()=>{let v=parseInt(ivMinInput.value);if(isNaN(v))v=150;if(v<100)v=100;if(v>192)v=192;ivMinSlider.value=v;if(ivMinDisplay)ivMinDisplay.textContent=v;});
  ivMinInput.addEventListener('change',()=>{let v=parseInt(ivMinInput.value);if(isNaN(v))v=150;if(v<100)v=100;if(v>192)v=192;ivMinInput.value=v;chrome.storage.local.set({ivMinimo:v});});
}

if(resetBtn)resetBtn.addEventListener('click',()=>{chrome.runtime.sendMessage({type:'resetStats'},(r)=>{if(r&&r.success){if(countLendaria)countLendaria.textContent='0';if(countEpica)countEpica.textContent='0';if(countRara)countRara.textContent='0';if(countTotal)countTotal.textContent='0';}});});
setInterval(carregarDashboard,2000);setInterval(carregarEstatisticas,2000);
setInterval(carregarListaAreas,5000);