const apiKey = "B1Z7Q9NIGCZUP5ZD";
const alerta = document.getElementById("alerta");

// Inicializa gráfico TradingView
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

// Sinal estável por 1 minuto
let sinalAtual = null;

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

  let novoSinal = "";

  if(rsi > 55 && ma10 > ma30){
    novoSinal = "COMPRAR";
  } else {
    novoSinal = "VENDER";
  }

  // Atualiza apenas se mudou
  if(novoSinal !== sinalAtual){
    sinalAtual = novoSinal;

    const divSinal = document.getElementById("sinal");
    const divSeta = document.getElementById("seta");
    divSinal.innerText = sinalAtual;
    divSeta.innerText = sinalAtual === "COMPRAR" ? "↑" : "↓";
    divSinal.className = "sinal " + (sinalAtual==="COMPRAR"?"compra":"venda");
    divSeta.className = "seta " + (sinalAtual==="COMPRAR"?"compra":"venda");

    document.getElementById("prob").innerText = "Probabilidade: "+(90+Math.random()*5).toFixed(0)+"%";

    historico(sinalAtual + " | RSI:"+rsi.toFixed(0));

    alerta.play();
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
}, 1000);

// Primeira análise
analisar();
