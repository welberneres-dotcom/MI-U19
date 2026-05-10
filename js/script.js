const firebaseConfig = {
    apiKey: "AIzaSyAXuajtBbVg-il6Z89fgd2xjcstaggHAOQ",
    authDomain: "mi-u19.firebaseapp.com",
    databaseURL: "https://mi-u19-default-rtdb.firebaseio.com",
    projectId: "mi-u19",
    storageBucket: "mi-u19.firebasestorage.app",
    messagingSenderId: "1095633099036",
    appId: "1:1095633099036:web:327abeb7f65f3c998402d9"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const EQUIPES_LISTA = [
    "VIVERTEC", "FLASHLIGHT", "MARVELTEC U-19", "TECFLOR", 
    "ROBOHERO", "MASERATI", "ROBO COC", "ROBOTEC-PED", 
    "ARTHEMIS", "FÚRIA", "ENGREBOT"
];

let curvas = 0;

function updateCurvas(val) {
    curvas = Math.max(0, curvas + val);
    const campo = document.getElementById('curvas-val');
    if(campo) { campo.innerText = curvas; calculate(); }
}

function calculate() {
    let total = 0;
    if(document.getElementById('item1')?.checked) total += 50;
    if(document.getElementById('item2')?.checked) total += 80;
    total += (curvas * 20);
    const deposito = document.querySelector('input[name="deposito"]:checked')?.value;
    if(deposito) total += parseInt(deposito);
    if(document.getElementById('bonus1')?.checked) total += 50;
    if(document.getElementById('bonus2')?.checked) total += 100;

    const display = document.getElementById('total');
    if(display) display.innerText = total;
}

function salvarPontuacao() {
    const equipe = document.getElementById('equipe-select').value;
    const tempoInput = document.getElementById('tempo-input');
    const totalSpan = document.getElementById('total');
    
    const tempo = parseInt(tempoInput.value);
    const pontos = parseInt(totalSpan.innerText) || 0;

    if (isNaN(tempo) || tempo <= 0) {
        alert("Erro: Informe o tempo total da prova!");
        tempoInput.focus();
        return;
    }

    db.ref('ranking/' + equipe).set({
        equipe: equipe,
        pontos: pontos,
        tempo: tempo
    }).then(() => {
        alert("Pontuação registrada!");
        resetForm();
    }).catch(e => alert("Erro: " + e.message));
}

function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if(!body) return;

    db.ref('ranking/').on('value', (snapshot) => {
        const dados = snapshot.val() || {};
        let lista = [];

        EQUIPES_LISTA.forEach(nome => {
            if (dados[nome]) {
                lista.push(dados[nome]);
            } else {
                lista.push({ equipe: nome, pontos: 0, tempo: 0 });
            }
        });

        lista.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            if (a.tempo === 0 && a.pontos === 0) return 1;
            if (b.tempo === 0 && b.pontos === 0) return -1;
            return a.tempo - b.tempo;
        });

        body.innerHTML = "";
        lista.forEach((item, index) => {
            body.innerHTML += `
                <tr>
                    <td class="posicao"><b>${index + 1}º</b></td>
                    <td style="text-align: left; font-weight: bold;">${item.equipe}</td>
                    <td class="pts">${item.pontos}</td>
                    <td>${item.tempo > 0 ? item.tempo + 's' : '---'}</td>
                </tr>`;
        });
    });
}

function resetForm() {
    curvas = 0;
    const cVal = document.getElementById('curvas-val');
    if(cVal) cVal.innerText = 0;
    document.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
    document.querySelectorAll('input[type=number]').forEach(n => n.value = "");
    document.querySelectorAll('input[name=deposito]').forEach(r => r.checked = r.value == "0");
    calculate();
}
