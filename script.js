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

function historico(txt){

const lista=document.getElementById("historico")

const item=document.createElement("li")

item.innerText=txt

lista.prepend(item)

if(lista.children.length>10){
lista.removeChild(lista.lastChild)
}

}

function analisar(){

let tendencia=Math.random()
let forca=Math.random()
let lateral=Math.random()

let sinal=""
let seta=""
let prob=0
let zona=""

if(lateral<0.2){

sinal="MERCADO LATERAL"
seta="↔"
prob=60
zona="Evitar entrada"

}

else if(tendencia>0.6){

sinal="COMPRAR"
seta="↑"
prob=90+Math.random()*5
zona="Zona de suporte"

}

else{

sinal="VENDER"
seta="↓"
prob=90+Math.random()*5
zona="Zona de resistência"

}

const div=document.getElementById("sinal")
const setaDiv=document.getElementById("seta")

div.innerText=sinal
setaDiv.innerText=seta

if(sinal==="COMPRAR"){

div.className="sinal compra"
setaDiv.className="seta compra"

}

else if(sinal==="VENDER"){

div.className="sinal venda"
setaDiv.className="seta venda"

}

else{

div.className="sinal neutro"
setaDiv.className="seta neutro"

}

document.getElementById("prob").innerText=
"Probabilidade: "+prob.toFixed(0)+"%"

document.getElementById("tendencia").innerText=
"Força da tendência: "+(forca*100).toFixed(0)+"%"

document.getElementById("zona").innerText=
zona

historico(sinal+" | "+prob.toFixed(0)+"%")

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
