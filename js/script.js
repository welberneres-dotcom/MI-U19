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

// --- LÓGICA DO JUIZ ---
function updateCurvas(val) {
    curvas = Math.max(0, curvas + val);
    const campo = document.getElementById('curvas-val');
    if (campo) { campo.innerText = curvas; calculate(); }
}

function calculate() {
    let total = 0;
    if (document.getElementById('item1')?.checked) total += 50;
    if (document.getElementById('item2')?.checked) total += 80;
    total += (curvas * 20);
    const deposito = document.querySelector('input[name="deposito"]:checked')?.value;
    if (deposito) total += parseInt(deposito);
    if (document.getElementById('total')) document.getElementById('total').innerText = total;
}

function salvarPontuacao() {
    const equipe = document.getElementById('equipe-select').value;
    const tempo = parseInt(document.getElementById('tempo-input').value);
    const pontos = parseInt(document.getElementById('total').innerText);

    if (isNaN(tempo) || tempo <= 0) {
        alert("Informe o tempo da prova!");
        return;
    }

    db.ref('ranking/' + equipe).set({
        equipe: equipe,
        pontos: pontos,
        tempo: tempo
    }).then(() => {
        alert("Salvo!");
        resetForm();
    });
}

function resetForm() {
    curvas = 0;
    if(document.getElementById('curvas-val')) document.getElementById('curvas-val').innerText = 0;
    document.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
    document.querySelectorAll('input[type=number]').forEach(n => n.value = "");
    if(document.getElementById('total')) document.getElementById('total').innerText = 0;
}

// --- LÓGICA DO RANKING (INDEX E ADMIN) ---
function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if (!body) return;

    db.ref('ranking/').on('value', (snapshot) => {
        const dadosDB = snapshot.val() || {};
        let rankingFinal = [];

        EQUIPES_LISTA.forEach(nome => {
            if (dadosDB[nome]) {
                rankingFinal.push(dadosDB[nome]);
            } else {
                rankingFinal.push({ equipe: nome, pontos: 0, tempo: 0 });
            }
        });

        // Ordenação: Pontos (Desc) -> Tempo (Asc)
        rankingFinal.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            if (a.tempo === 0 && a.pontos === 0) return 1;
            if (b.tempo === 0 && b.pontos === 0) return -1;
            return a.tempo - b.tempo;
        });

        body.innerHTML = "";
        rankingFinal.forEach((item, index) => {
            body.innerHTML += `
                <tr>
                    <td class="posicao">${index + 1}º</td>
                    <td style="text-align: left; font-weight: bold;">${item.equipe}</td>
                    <td class="pts">${item.pontos}</td>
                    <td>${item.tempo > 0 ? item.tempo + 's' : '---'}</td>
                </tr>`;
        });
    });
}
