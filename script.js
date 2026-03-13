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
const lista=document.getElementById("historico");
const item=document.createElement("li");
item.innerText=txt;
lista.prepend(item);
if(lista.children.length>10) lista.removeChild(lista.lastChild);
}

// Função para simular dados reais do gráfico (substituir futuramente com API interna TradingView se quiser real-time completo)
function pegarDados(){
let precos=[];
for(let i=0;i<60;i++){
precos.push(1.05 + Math.random()*0.01); // Simulação de preço real
}
return precos;
}

// Calcula média
function media(lista){
return lista.reduce((a,b)=>a+b,0)/lista.length;
}

// Calcula RSI simples
function calcularRSI(precos){
let ganhos=0, perdas=0;
for(let i=1;i<precos.length;i++){
let diff=precos[i]-precos[i-1];
if(diff>0) ganhos+=diff;
else perdas-=diff;
}
let rs=ganhos/perdas || 0.0001;
return 100-(100/(1+rs));
}

// Calcula MACD simples
function calcularMACD(precos){
let ema12=media(precos.slice(-12));
let ema26=media(precos.slice(-26));
return ema12-ema26;
}

// Analisa e define sinal
function analisar(){
const closes=pegarDados();
const rsi=calcularRSI(closes);
const macd=calcularMACD(closes);
const ma10=media(closes.slice(-10));
const ma30=media(closes.slice(-30));

let sinal="", seta="", prob=0;

if(rsi>55 && macd>0 && ma10>ma30){
sinal="COMPRAR";
seta="↑";
prob=88+Math.random()*7;
}else if(rsi<45 && macd<0 && ma10<ma30){
sinal="VENDER";
seta="↓";
prob=88+Math.random()*7;
}else{
sinal="AGUARDAR";
seta="↔";
prob=70+Math.random()*10;
}

const div=document.getElementById("sinal");
div.innerText=sinal;
const setaDiv=document.getElementById("seta");
setaDiv.innerText=seta;

if(sinal==="COMPRAR"){div.className="sinal compra"; setaDiv.className="seta compra";}
else if(sinal==="VENDER"){div.className="sinal venda"; setaDiv.className="seta venda";}
else{div.className="sinal neutro"; setaDiv.className="seta neutro";}

document.getElementById("prob").innerText="Probabilidade: "+prob.toFixed(0)+"%";
document.getElementById("tendencia").innerText="RSI: "+rsi.toFixed(0)+" | MACD: "+macd.toFixed(5);

historico(sinal+" | "+prob.toFixed(0)+"%");
}

let tempo=60;
setInterval(()=>{
tempo--;
document.getElementById("tempo").innerText="Nova análise em "+tempo+"s";
if(tempo<=0){analisar(); tempo=60;}
},1000);

analisar();
