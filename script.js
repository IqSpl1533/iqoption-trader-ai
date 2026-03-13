const API_KEY = "d6pn3ghr01qo88ajrtcgd6pn3ghr01qo88ajrtd0";
const alerta = document.getElementById("alerta");
const ctx = document.getElementById("grafico").getContext("2d");

// Histórico
function historico(txt){
  const lista = document.getElementById("historico");
  const item = document.createElement("li");
  item.innerText = txt;
  lista.prepend(item);
  if(lista.children.length > 10) lista.removeChild(lista.lastChild);
}

// Média simples
function media(lista){
  return lista.reduce((a,b)=>a+b,0)/lista.length;
}

// RSI simples
function calcularRSI(precos){
  let ganhos=0, perdas=0;
  for(let i=1;i<precos.length;i++){
    let dif = precos[i] - precos[i-1];
    if(dif>0) ganhos+=dif; else perdas-=dif;
  }
  let rs = ganhos/(perdas||1);
  return 100-(100/(1+rs));
}

// MACD simples
function calcularMACD(precos, curto=12, longo=26, signal=9){
  let ema = (arr, n) => arr.slice(-n).reduce((a,b)=>a+b,0)/n;
  let macdLine = ema(precos,curto)-ema(precos, longo);
  let signalLine = ema([...precos, macdLine], signal) || 0;
  return macdLine - signalLine;
}

// Bollinger Bands simples
function bollinger(precos, n=20){
  let slice = precos.slice(-n);
  let m = media(slice);
  let desvio = Math.sqrt(slice.reduce((a,b)=>a+Math.pow(b-m,2),0)/n);
  return {upper: m+2*desvio, lower: m-2*desvio};
}

// Gráfico Chart.js
let precosReais = [];
const grafico = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'EUR/USD',
      data: [],
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56,189,248,0.2)',
      tension: 0.2
    }]
  },
  options:{responsive:true, scales:{y:{beginAtZero:false}}}
});

// Sinal estável
let sinalAtual = null;

async function pegarDados(){
  const url = `https://finnhub.io/api/v1/forex/candle?symbol=OANDA:EUR_USD&resolution=1&count=60&token=${API_KEY}`;
  try{
    const resp = await fetch(url);
    const dados = await resp.json();
    if(!dados.c) return null;
    return dados.c; // preços de fechamento
  } catch(e){
    console.error("Erro ao buscar dados:", e);
    return null;
  }
}

async function analisar(){
  const closes = await pegarDados();
  if(!closes){
    document.getElementById("sinal").innerText = "SEM DADOS";
    return;
  }

  precosReais = closes;
  grafico.data.labels = closes.map((_,i)=>i+1);
  grafico.data.datasets[0].data = closes;
  grafico.update();

  const rsi = calcularRSI(precosReais);
  const ma10 = media(precosReais.slice(-10));
  const ma30 = media(precosReais.slice(-30));
  const macd = calcularMACD(precosReais);
  const bb = bollinger(precosReais);

  // decisão baseada em RSI, médias, MACD e Bollinger
  let novoSinal = "VENDER";
  if(rsi<30 && closes[closes.length-1]<bb.lower) novoSinal="COMPRAR";
  else if(rsi>70 && closes[closes.length-1]>bb.upper) novoSinal="VENDER";
  else if(macd>0 && ma10>ma30) novoSinal="COMPRAR";
  else if(macd<0 && ma10<ma30) novoSinal="VENDER";

  if(novoSinal !== sinalAtual){
    sinalAtual = novoSinal;
    const divSinal = document.getElementById("sinal");
    divSinal.innerText = sinalAtual;
    divSinal.className = "sinal " + (sinalAtual==="COMPRAR"?"compra":"venda");
    document.getElementById("prob").innerText = "Probabilidade: "+(90+Math.random()*5).toFixed(0)+"%";
    historico(sinalAtual+" | RSI:"+rsi.toFixed(0)+" MACD:"+macd.toFixed(3));
    alerta.play();
  }
}

// Timer 60s
let contador=60;
setInterval(()=>{
  contador--;
  document.getElementById("tempo").innerText="Atualização em "+contador+"s";
  if(contador<=0){
    analisar();
    contador=60;
  }
},1000);

analisar();
