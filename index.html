// CONFIGURAÇÃO DO SEU FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAXuajtBbVg-il6Z89fgd2xjcstaggHAOQ",
    authDomain: "mi-u19.firebaseapp.com",
    databaseURL: "https://mi-u19-default-rtdb.firebaseio.com",
    projectId: "mi-u19",
    storageBucket: "mi-u19.firebasestorage.app",
    messagingSenderId: "1095633099036",
    appId: "1:1095633099036:web:327abeb7f65f3c998402d9",
    measurementId: "G-3R4VG0S190"
};

// Inicializa o Firebase (Verifica se já não foi inicializado)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let curvas = 0;

// --- FUNÇÕES DO JUIZ (ADMIN) ---
function updateCurvas(val) {
    curvas = Math.max(0, curvas + val);
    const campo = document.getElementById('curvas-val');
    if(campo) {
        campo.innerText = curvas;
        calculate();
    }
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

function salvarFirebase() {
    const equipe = document.getElementById('equipe-select').value;
    const tempo = parseInt(document.getElementById('tempo-input').value);
    const pontos = parseInt(document.getElementById('total').innerText);

    if (isNaN(tempo) || tempo <= 0) {
        alert("Erro: Informe o tempo da prova!");
        return;
    }

    db.ref('ranking/' + equipe).set({
        equipe: equipe,
        pontos: pontos,
        tempo: tempo
    }).then(() => {
        alert("Pontuação registrada!");
        resetForm();
    }).catch(error => {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar: " + error.message);
    });
}

// --- FUNÇÃO DO PÚBLICO (INDEX) ---
function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if(!body) return;

    console.log("Tentando ler dados do Firebase...");

    db.ref('ranking/').on('value', (snapshot) => {
        const dados = snapshot.val();
        console.log("Dados recebidos:", dados); // Para você checar no F12
        let lista = [];

        if (dados) {
            Object.keys(dados).forEach(key => {
                lista.push(dados[key]);
            });

            // Ordenação: 1º Pontos (Maior), 2º Tempo (Menor)
            lista.sort((a, b) => {
                if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                return a.tempo - b.tempo;
            });
        }

        body.innerHTML = ""; 

        if (lista.length === 0) {
            body.innerHTML = "<tr><td colspan='4'>Nenhuma pontuação registrada.</td></tr>";
        } else {
            lista.forEach((item, index) => {
                body.innerHTML += `
                    <tr>
                        <td class="posicao"><b>${index + 1}º</b></td>
                        <td style="text-align: left; font-weight: bold;">${item.equipe}</td>
                        <td class="pts" style="color: #2563eb; font-weight: bold; font-size: 1.2rem;">${item.pontos}</td>
                        <td>${item.tempo}s</td>
                    </tr>`;
            });
        }
    }, (error) => {
        console.error("Erro de permissão:", error);
        body.innerHTML = "<tr><td colspan='4' style='color:red'>Erro de acesso: Verifique as Regras no Console do Firebase.</td></tr>";
    });
}

function resetForm() {
    curvas = 0;
    const curvasVal = document.getElementById('curvas-val');
    if(curvasVal) curvasVal.innerText = 0;
    const checks = ['item1', 'item2', 'bonus1', 'bonus2'];
    checks.forEach(id => { if(document.getElementById(id)) document.getElementById(id).checked = false; });
    if(document.getElementById('tempo-input')) document.getElementById('tempo-input').value = "";
    document.querySelectorAll('input[name="deposito"]').forEach(r => r.checked = r.value == "0");
    calculate();
}
