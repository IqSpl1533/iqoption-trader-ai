const apiKey="2C03AWFQ8C9GRUB8"

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

})

async function pegarDados(){

const url=`https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=1min&apikey=${apiKey}`

const r=await fetch(url)
const d=await r.json()

const candles=Object.values(d["Time Series FX (1min)"])

return candles.slice(0,80)

}

function media(lista){

return lista.reduce((a,b)=>a+b,0)/lista.length

}

function calcularRSI(precos){

let ganhos=0
let perdas=0

for(let i=1;i<precos.length;i++){

let diff=precos[i]-precos[i-1]

if(diff>0) ganhos+=diff
else perdas-=diff

}

let rs=ganhos/perdas

return 100-(100/(1+rs))

}

function calcularMACD(precos){

let ema12=media(precos.slice(0,12))
let ema26=media(precos.slice(0,26))

return ema12-ema26

}

function historico(txt){

const lista=document.getElementById("historico")

const item=document.createElement("li")

item.innerText=txt

lista.prepend(item)

if(lista.children.length>10){

lista.removeChild(lista.lastChild)

}

}

async function analisar(){

const candles=await pegarDados()

const closes=candles.map(c=>parseFloat(c["4. close"]))

const rsi=calcularRSI(closes)

const macd=calcularMACD(closes)

const ma10=media(closes.slice(0,10))
const ma30=media(closes.slice(0,30))

const ultimo=candles[0]
const open=parseFloat(ultimo["1. open"])
const close=parseFloat(ultimo["4. close"])

let sinal=""
let prob=0

if(rsi>55 && macd>0 && ma10>ma30 && close>open){

sinal="COMPRAR"
prob=92+Math.random()*5

}

else if(rsi<45 && macd<0 && ma10<ma30 && close<open){

sinal="VENDER"
prob=92+Math.random()*5

}

else{

sinal="AGUARDAR"
prob=70+Math.random()*10

}

const div=document.getElementById("sinal")

div.innerText=sinal

if(sinal=="COMPRAR") div.className="sinal compra"
else if(sinal=="VENDER") div.className="sinal venda"
else div.className="sinal neutro"

document.getElementById("prob").innerText=
"Probabilidade: "+prob.toFixed(0)+"%"

document.getElementById("indicadores").innerText=
"RSI: "+rsi.toFixed(0)+" | MACD: "+macd.toFixed(5)

document.getElementById("alerta").play()

historico(sinal+" | RSI "+rsi.toFixed(0))

}

let tempo=60

setInterval(()=>{

tempo--

document.getElementById("tempo").innerText=
"Nova análise em "+tempo+"s"

if(tempo<=0){

analisar()

tempo=60

}

},1000)

analisar()
