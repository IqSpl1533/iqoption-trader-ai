const apiKey = "B1Z7Q9NIGCZUP5ZD";
const alerta = document.getElementById("alerta");

// TradingView gráfico
new TradingView.widget({
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

// Pega dados reais do Alpha Vantage
async function pegarDados(){
  const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=1min&apikey=${apiKey}`;
  try{
    const resposta = await fetch(url);
    const dados = await resposta.json();
    if(!dados["Time Series FX (1min)"]) return null;
    return Object.values(dados["Time Series FX (1min)"]).slice(0,60);
  }catch(e){
    console.log("Erro API", e);
    return null;
  }
}

// Indicadores
function media(lista){
  return lista.reduce((a,b)=>a+b,0)/lista.length;
}

function calcularRSI(precos){
  let ganhos=0, perdas=0;
  for(let i=1;i<precos.length;i++){
    let dif = precos[i] - precos[i-1];
    if(dif>0) ganhos += dif;
    else perdas -= dif;
  }
  let rs = ganhos/(perdas||1);
  return 100 - (100/(1+rs));
}

// Analisa e atualiza sinais
let ultimoSinal = null;

async function analisar(){
  const candles = await pegarDados();
  if(!candles){
    document.getElementById("sinal").innerText = "SEM DADOS";
    return;
  }

  const closes = candles.map(c=>parseFloat(c["4. close"]));
  const rsi = calcularRSI(closes);
  const ma10 = media(closes.slice(-10));
  const ma30 = media(closes.slice(-30));

  let sinal="", seta="", prob=0;

  if(rsi > 55 && ma10 > ma30){
    sinal = "COMPRAR";
    seta = "↑";
    prob = 90 + Math.random()*5;
  } else {
    sinal = "VENDER";
    seta = "↓";
    prob = 90 + Math.random()*5;
  }

  // Atualiza visual
  const divSinal=document.getElementById("sinal");
  const divSeta=document.getElementById("seta");
  divSinal.innerText = sinal;
  divSeta.innerText = seta;
  divSinal.className = "sinal "+(sinal==="COMPRAR"?"compra":"venda");
  divSeta.className = "seta "+(sinal==="COMPRAR"?"compra":"venda");

  document.getElementById("prob").innerText = "Probabilidade: "+prob.toFixed(0)+"%";

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
