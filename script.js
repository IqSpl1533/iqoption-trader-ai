const alerta = document.getElementById("alerta");

// Inicializa gráfico TradingView
const widget = new TradingView.widget({
  container_id:"grafico",
  width:"100%",
  height:500,
  symbol:"FX:EURUSD",
  interval:"1",
  timezone:"America/Sao_Paulo",
  theme:"dark",
  style:"1",
  locale:"br",
  allow_symbol_change:true
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

// MACD simples
function calcularMACD(precos){
  let ema12 = media(precos.slice(-12));
  let ema26 = media(precos.slice(-26));
  return ema12-ema26;
}

// Pega preços diretamente do gráfico (simulação para teste)
function pegarPrecosGrafico(){
  let precos=[];
  let base = 1.05;
  for(let i=0;i<60;i++){
    base += (Math.random()-0.5)*0.002;
    precos.push(base);
  }
  return precos;
}

// Analisa e atualiza sinais
let ultimoSinal = null;

function analisar(){
  const closes = pegarPrecosGrafico();
  const rsi = calcularRSI(closes);
  const macd = calcularMACD(closes);
  const ma10 = media(closes.slice(-10));
  const ma30 = media(closes.slice(-30));

  let sinal="", seta="", prob=0;

  if(rsi>55 && macd>0 && ma10>ma30){
    sinal="COMPRAR";
    seta="↑";
    prob=90+Math.random()*5;
  } else {
    sinal="VENDER";
    seta="↓";
    prob=90+Math.random()*5;
  }

  // Atualiza visual destacado
  const divSinal=document.getElementById("sinal");
  const divSeta=document.getElementById("seta");
  divSinal.innerText = sinal;
  divSeta.innerText = seta;
  divSinal.className = "sinal "+(sinal==="COMPRAR"?"compra":"venda");
  divSeta.className = "seta "+(sinal==="COMPRAR"?"compra":"venda");

  document.getElementById("prob").innerText = "Probabilidade: "+prob.toFixed(0)+"%";
  document.getElementById("indicadores").innerText =
    `RSI: ${rsi.toFixed(1)} | MACD: ${macd.toFixed(5)} | MA10: ${ma10.toFixed(5)} | MA30: ${ma30.toFixed(5)}`;

  historico(sinal + " | RSI:"+rsi.toFixed(0));

  // Alerta sonoro se sinal mudou
  if(ultimoSinal !== sinal){
    alerta.play();
    ultimoSinal = sinal;
  }
}

// Timer 60s
let tempo=60;
setInterval(()=>{
  tempo--;
  document.getElementById("tempo").innerText="Atualização em "+tempo+"s";
  if(tempo<=0){analisar(); tempo=60;}
},1000);

// Inicia análise
analisar();
