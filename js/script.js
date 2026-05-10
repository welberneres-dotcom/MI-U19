// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAXuajtBbVg-il6Z89fgd2xjcstaggHAOQ",
    authDomain: "mi-u19.firebaseapp.com",
    databaseURL: "https://mi-u19-default-rtdb.firebaseio.com",
    projectId: "mi-u19",
    storageBucket: "mi-u19.firebasestorage.app",
    messagingSenderId: "1095633099036",
    appId: "1:1095633099036:web:327abeb7f65f3c998402d9"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// LISTA MESTRA (Exatamente como na sua imagem)
const EQUIPES_ESTATICAS = [
    "VIVERTEC", "FLASHLIGHT", "MARVELTEC U-19", "TECFLOR", 
    "ROBOHERO", "MASERATI", "ROBO COC", "ROBOTEC-PED", 
    "ARTHEMIS", "FÚRIA", "ENGREBOT"
];

function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if(!body) return;

    // Escuta o banco de dados em tempo real
    db.ref('ranking/').on('value', (snapshot) => {
        const dadosDB = snapshot.val() || {};
        let rankingFinal = [];

        // Cruza a lista mestra com os dados vindos do Firebase
        EQUIPES_ESTATICAS.forEach(nomeEquipe => {
            if (dadosDB[nomeEquipe]) {
                // Se a equipe já tem dados no banco, usa eles
                rankingFinal.push({
                    equipe: nomeEquipe,
                    pontos: parseInt(dadosDB[nomeEquipe].pontos) || 0,
                    tempo: parseInt(dadosDB[nomeEquipe].tempo) || 0
                });
            } else {
                // Se não tem dados, inicia zerada
                rankingFinal.push({
                    equipe: nomeEquipe,
                    pontos: 0,
                    tempo: 0
                });
            }
        });

        // ORDENAÇÃO: 1º Pontos (Maior para menor) | 2º Tempo (Menor para maior)
        rankingFinal.sort((a, b) => {
            if (b.pontos !== a.pontos) {
                return b.pontos - a.pontos; // Maior pontuação ganha
            }
            // Critério de Desempate: Menor tempo ganha
            // Tratamento: quem tem tempo 0 e pontos 0 fica por último
            if (a.tempo === 0 && a.pontos === 0) return 1;
            if (b.tempo === 0 && b.pontos === 0) return -1;
            return a.tempo - b.tempo; 
        });

        // Atualiza a tabela no HTML
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

// --- FUNÇÕES DA CALCULADORA (ADMIN) ---
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
    const tempo = parseInt(document.getElementById('tempo-input').value);
    const pontos = parseInt(document.getElementById('total').innerText);

    if (isNaN(tempo) || tempo <= 0) {
        alert("Erro: Informe o tempo total da prova em segundos!");
        return;
    }

    db.ref('ranking/' + equipe).set({
        equipe: equipe,
        pontos: pontos,
        tempo: tempo
    }).then(() => {
        alert("Pontuação de " + equipe + " enviada com sucesso!");
        resetForm();
    }).catch(error => alert("Erro ao salvar: " + error.message));
}

// --- FUNÇÃO DO PÚBLICO (RANKING) ---
function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if(!body) return;

    db.ref('ranking/').on('value', (snapshot) => {
        const dadosDB = snapshot.val() || {};
        let rankingFinal = [];

        // Preenche todas as equipes, usando dados do DB ou zerando as que não jogaram
        EQUIPES_LISTA.forEach(nome => {
            if (dadosDB[nome]) {
                rankingFinal.push(dadosDB[nome]);
            } else {
                rankingFinal.push({ equipe: nome, pontos: 0, tempo: 0 });
            }
        });

        // ORDENAÇÃO: 1º Pontos (Desc), 2º Tempo (Asc)
        rankingFinal.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            // Se empatar em pontos, o menor tempo ganha. 
            // Se o tempo for 0 (não jogou), ele vai para o fim do empate.
            if (a.tempo === 0) return 1;
            if (b.tempo === 0) return -1;
            return a.tempo - b.tempo;
        });

        body.innerHTML = "";
        rankingFinal.forEach((item, index) => {
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
    const curvasVal = document.getElementById('curvas-val');
    if(curvasVal) curvasVal.innerText = 0;
    document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
    document.querySelectorAll('input[type=number]').forEach(el => el.value = "");
    document.querySelectorAll('input[name=deposito]').forEach(el => el.checked = el.value == "0");
    calculate();
}
