// 1. CONFIGURAÇÃO (Use os seus dados reais aqui)
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

// 2. INICIALIZAÇÃO (Modo Compatibilidade - Sem 'import')
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 3. LISTA DE EQUIPES
const EQUIPES_LISTA = [
    "VIVERTEC", "FLASHLIGHT", "MARVELTEC U-19", "TECFLOR", 
    "ROBOHERO", "MASERATI", "ROBO COC", "ROBOTEC-PED", 
    "ARTHEMIS", "FÚRIA", "ENGREBOT"
];

let curvas = 0;

// --- FUNÇÃO PARA ZERAR (RESOLVENDO O SEU PROBLEMA) ---
function zerarRanking() {
    console.log("Botão zerar clicado"); // Isso aparecerá no F12 se funcionar
    if (confirm("⚠️ ATENÇÃO: Deseja APAGAR TODAS as pontuações?")) {
        db.ref('ranking').remove()
            .then(() => {
                alert("✅ Competição zerada!");
                location.reload(); // Recarrega para limpar a tela
            })
            .catch(error => alert("Erro: " + error.message));
    }
}

// --- FUNÇÕES DE CÁLCULO ---
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
    const deposito = document.querySelector('input[name="deposito"]:checked');
    if (deposito) total += parseInt(deposito.value);
    const display = document.getElementById('total');
    if (display) display.innerText = total;
}

function salvarPontuacao() {
    const equipe = document.getElementById('equipe-select')?.value;
    const tempo = parseInt(document.getElementById('tempo-input')?.value);
    const pontos = parseInt(document.getElementById('total')?.innerText);

    if (!equipe || isNaN(tempo)) {
        alert("Preencha o tempo antes de salvar!");
        return;
    }

    db.ref('ranking/' + equipe).set({
        equipe: equipe,
        pontos: pontos,
        tempo: tempo
    }).then(() => {
        alert("Pontuação salva!");
        resetForm();
    });
}

// --- CARREGAR DADOS NO INDEX E ADMIN ---
function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if (!body) return;

    // Popula o select se for o Admin
    const select = document.getElementById('equipe-select');
    if (select) {
        select.innerHTML = "";
        EQUIPES_LISTA.forEach(e => {
            select.innerHTML += `<option value="${e}">${e}</option>`;
        });
    }

    // Escuta o Firebase
    db.ref('ranking/').on('value', (snapshot) => {
        const dadosDB = snapshot.val() || {};
        let lista = [];

        EQUIPES_LISTA.forEach(nome => {
            if (dadosDB[nome]) {
                lista.push(dadosDB[nome]);
            } else {
                lista.push({ equipe: nome, pontos: 0, tempo: 0 });
            }
        });

        // Ordenação
        lista.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            if (a.tempo === 0) return 1;
            if (b.tempo === 0) return -1;
            return a.tempo - b.tempo;
        });

        body.innerHTML = "";
        lista.forEach((item, index) => {
            const thAcao = document.querySelector('th:nth-child(5)');
            let tdAcao = thAcao ? `<td><button class="btn-del" onclick="excluirEquipe('${item.equipe}')">Excluir</button></td>` : "";
            
            body.innerHTML += `
                <tr>
                    <td>${index + 1}º</td>
                    <td style="text-align:left">${item.equipe}</td>
                    <td>${item.pontos}</td>
                    <td>${item.tempo > 0 ? item.tempo + 's' : '---'}</td>
                    ${tdAcao}
                </tr>`;
        });
    });
}

function excluirEquipe(nome) {
    if (confirm("Excluir " + nome + "?")) db.ref('ranking/' + nome).remove();
}

function resetForm() {
    curvas = 0;
    document.getElementById('curvas-val').innerText = "0";
    document.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
    document.getElementById('tempo-input').value = "";
    document.getElementById('total').innerText = "0";
}
