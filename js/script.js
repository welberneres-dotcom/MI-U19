// CONFIGURAÇÃO DO FIREBASE (Suas credenciais reais)
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

// INICIALIZAÇÃO CORRETA (Modo Compatível)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database(); // AGORA O 'db' EXISTE!

const EQUIPES_LISTA = [
    "VIVERTEC", "FLASHLIGHT", "MARVELTEC U-19", "TECFLOR", 
    "ROBOHERO", "MASERATI", "ROBO COC", "ROBOTEC-PED", 
    "ARTHEMIS", "FÚRIA", "ENGREBOT"
];

let curvas = 0;

// --- FUNÇÕES DE CÁLCULO E ADMIN ---

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
    
    const depositoSelecionado = document.querySelector('input[name="deposito"]:checked');
    if (depositoSelecionado) total += parseInt(depositoSelecionado.value);
    
    const display = document.getElementById('total');
    if (display) display.innerText = total;
}

function salvarPontuacao() {
    const equipe = document.getElementById('equipe-select')?.value;
    const tempoInput = document.getElementById('tempo-input');
    const totalSpan = document.getElementById('total');

    if (!equipe) return;
    const tempo = parseInt(tempoInput.value);
    const pontos = parseInt(totalSpan.innerText);

    if (isNaN(tempo) || tempo <= 0) {
        alert("Informe o tempo total da prova!");
        tempoInput.focus();
        return;
    }

    // Salvando no Banco de Dados
    db.ref('ranking/' + equipe).set({
        equipe: equipe,
        pontos: pontos,
        tempo: tempo
    }).then(() => {
        alert("Pontuação de " + equipe + " enviada!");
        resetForm();
    }).catch(e => alert("Erro ao salvar: " + e.message));
}

// --- LÓGICA DO RANKING (PÚBLICO E ADMIN) ---

function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if (!body) return;

    const select = document.getElementById('equipe-select');
    if (select) {
        select.innerHTML = ""; 
        EQUIPES_LISTA.forEach(equipe => {
            let option = document.createElement('option');
            option.value = equipe;
            option.text = equipe;
            select.appendChild(option);
        });
    }

    db.ref('ranking/').on('value', (snapshot) => {
        const dadosDB = snapshot.val() || {};
        let listaRanking = [];

        EQUIPES_LISTA.forEach(nomeEquipe => {
            if (dadosDB[nomeEquipe]) {
                listaRanking.push(dadosDB[nomeEquipe]);
            } else {
                listaRanking.push({ equipe: nomeEquipe, pontos: 0, tempo: 0 });
            }
        });

        listaRanking.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            if (a.tempo === 0) return 1;
            if (b.tempo === 0) return -1;
            return a.tempo - b.tempo;
        });

        body.innerHTML = "";
        listaRanking.forEach((item, index) => {
            const thAcao = document.querySelector('th:nth-child(5)');
            let tdAcao = ""; 
            
            if (thAcao) {
                tdAcao = (item.pontos > 0 || item.tempo > 0) 
                    ? `<td><button class="btn-del" onclick="excluirEquipe('${item.equipe}')">Excluir</button></td>`
                    : `<td>---</td>`;
            }

            body.innerHTML += `
                <tr>
                    <td class="posicao"><b>${index + 1}º</b></td>
                    <td style="text-align: left; font-weight: bold;">${item.equipe}</td>
                    <td class="pts">${item.pontos}</td>
                    <td>${item.tempo > 0 ? item.tempo + 's' : '---'}</td>
                    ${tdAcao}
                </tr>`;
        });
    });
}

function excluirEquipe(nome) {
    if (confirm("Excluir pontuação de " + nome + "?")) {
        db.ref('ranking/' + nome).remove();
    }
}

function resetForm() {
    curvas = 0;
    if (document.getElementById('curvas-val')) document.getElementById('curvas-val').innerText = 0;
    document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
    document.querySelectorAll('input[type=number]').forEach(el => el.value = "");
    if (document.getElementById('total')) document.getElementById('total').innerText = 0;
    // Reseta o rádio para "Não entregue"
    const radioPadrao = document.querySelector('input[name="deposito"][value="0"]');
    if (radioPadrao) radioPadrao.checked = true;
}
