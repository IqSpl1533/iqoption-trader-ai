const alerta = document.getElementById("alerta");

// Inicializa gráfico TradingView
const tvWidget = new TradingView.widget({
  container_id:"grafico",
  width:"100%",
  height:500,
  symbol:"FX:EURUSD",
  interval:"1",
  timezone:"America/Sao_Paulo",
  theme:"dark",
  style:"1",
  locale:"br"
});

// Histórico
function historico(txt){
  const lista = document.getElementById("historico");
  const item = document.createElement("li");
  item.innerText = txt;
  lista.prepend(item);
  if(lista.children.length > 10){
    lista.removeChild(lista.lastChild);
  }
}

// Média simples
function media(lista){
  return lista.reduce((a,b)=>a+b,0)/lista.length;
}

// RSI simples
function calcularRSI(precos){
  let ganhos=0, perdas=0;
  for(let i=1;i<precos.length;i++){
    let dif = precos[i]-precos[i-1];
    if(dif>0) ganhos+=dif;
    else perdas-=dif;
  }
  let rs = ganhos/(perdas||1);
  return 100-(100/(1+rs));
}

// Preços simulados
function pegarPrecosSimulados(){
  let precos=[];
  let base = 1.05;
  for(let i=0;i<60;i++){
    base += (Math.random()-0.5)*0.002;
    precos.push(base);
  }
  return precos;
}

// Sinal estável e setas animadas
let sinalAtual = null;
let setas = [];

function desenharSetaGrafico(sinal){
  // Remove setas antigas
  setas.forEach(s => s.remove());
  setas = [];

  const grafico = document.getElementById("grafico");
  const seta = document.createElement("div");
  seta.className = "grafico-seta";
  seta.style.color = sinal==="COMPRAR"?"#22c55e":"#ef4444";
  seta.innerText = sinal==="COMPRAR"?"↑":"↓";
  seta.style.left = `${40 + Math.random()*20}%`; // posição aleatória horizontal
  seta.style.top = `${10 + Math.random()*20}px`; // posição vertical leve
  grafico.appendChild(seta);
  setas.push(seta);
}

// Análise e atualização
function analisar(){
  const closes = pegarPrecosSimulados();
  const rsi = calcularRSI(closes);
  const ma10 = media(closes.slice(-10));
  const ma30 = media(closes.slice(-30));

  let novoSinal = rsi>55 && ma10>ma30 ? "COMPRAR" : "VENDER";

  if(novoSinal !== sinalAtual){
    sinalAtual = novoSinal;

    const divSinal = document.getElementById("sinal");
    const divSeta = document.getElementById("seta");
    divSinal.innerText = sinalAtual;
    divSeta.innerText = sinalAtual==="COMPRAR"?"↑":"↓";
    divSinal.className = "sinal " + (sinalAtual==="COMPRAR"?"compra":"venda");
    divSeta.className = "seta " + (sinalAtual==="COMPRAR"?"compra":"venda");

    document.getElementById("prob").innerText = "Probabilidade: "+(90+Math.random()*5).toFixed(0)+"%";

    historico(sinalAtual+" | RSI:"+rsi.toFixed(0));

    alerta.play();

    // Desenha setas no gráfico simulando trades
    desenharSetaGrafico(sinalAtual);
  }
}

// Timer 60s
let contador = 60;
setInterval(()=>{
  contador--;
  document.getElementById("tempo").innerText="Atualização em "+contador+"s";
  if(contador <= 0){
    analisar();
    contador = 60;
  }
},1000);

// Primeira análise
analisar();
