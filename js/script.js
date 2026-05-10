// CONFIGURAÇÃO DO FIREBASE (Preencha as suas credenciais aqui!)
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "0000000000",
    appId: "1:..."
};

// Inicializa Firebase Compat
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// LISTA FIXA DE EQUIPES (Garante que todas apareçam zeradas)
const EQUIPES_LISTA = [
    "VIVERTEC", "FLASHLIGHT", "MARVELTEC U-19", "TECFLOR", 
    "ROBOHERO", "MASERATI", "ROBO COC", "ROBOTEC-PED", 
    "ARTHEMIS", "FÚRIA", "ENGREBOT"
];

let curvas = 0;

// --- LÓGICA DO JUIZ (ADMIN) ---

function updateCurvas(val) {
    curvas = Math.max(0, curvas + val);
    const campo = document.getElementById('curvas-val');
    if (campo) { campo.innerText = curvas; calculate(); }
}

function calculate() {
    let total = 0;
    
    // Missões Iniciais
    if (document.getElementById('item1')?.checked) total += 50;
    if (document.getElementById('item2')?.checked) total += 80;
    
    // Navegação (Curvas)
    total += (curvas * 20);
    
    // Local de Depósito (Pega o valor de qualquer rádio selecionado)
    const depositoSelecionado = document.querySelector('input[name="deposito"]:checked');
    if (depositoSelecionado) {
        total += parseInt(depositoSelecionado.value);
    }
    
    // Atualiza o display de pontos
    const display = document.getElementById('total');
    if (display) display.innerText = total;
}

function salvarPontuacao() {
    const equipe = document.getElementById('equipe-select')?.value;
    const tempoInput = document.getElementById('tempo-input');
    const totalSpan = document.getElementById('total');

    if (!equipe) return;

    // Converte para número e valida
    const tempo = parseInt(tempoInput.value);
    const pontos = parseInt(totalSpan.innerText);

    if (isNaN(tempo) || tempo <= 0) {
        alert("Informe o tempo total da prova!");
        tempoInput.focus();
        return;
    }

    // Grava no Firebase usando o nome da equipe como ID
    db.ref('ranking/' + equipe).set({
        equipe: equipe,
        pontos: pontos,
        tempo: tempo
    }).then(() => {
        alert("Pontuação de " + equipe + " enviada!");
        resetForm();
    }).catch(e => alert("Erro ao salvar: " + e.message));
}

// --- LÓGICA DO RANKING (ADMIN E INDEX) ---

function carregarFirebase() {
    // 1. Popula o Select (apenas se estiver no Admin)
    const select = document.getElementById('equipe-select');
    if (select) {
        select.innerHTML = ""; // Limpa
        EQUIPES_LISTA.forEach(equipe => {
            let option = document.createElement('option');
            option.value = equipe;
            option.text = equipe;
            select.appendChild(option);
        });
    }

    // 2. Escuta o ranking em tempo real (.on)
    const body = document.getElementById('ranking-body');
    if (!body) return;

    db.ref('ranking/').on('value', (snapshot) => {
        const dadosDB = snapshot.val() || {};
        let listaRanking = [];

        // Cruza a lista fixa com os dados do banco
        EQUIPES_LISTA.forEach(nomeEquipe => {
            if (dadosDB[nomeEquipe]) {
                // Se já jogou, usa os dados reais
                listaRanking.push(dadosDB[nomeEquipe]);
            } else {
                // Se não jogou, inicia zerado
                listaRanking.push({
                    equipe: nomeEquipe,
                    pontos: 0,
                    tempo: 0
                });
            }
        });

        // Ordenação: Pontos (maior primeiro), Tempo (menor primeiro como desempate)
        listaRanking.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            // Desempate: quem fez tempo menor ganha
            // Tratamento: quem não jogou (tempo 0) fica por último no empate de zero pontos
            if (a.tempo === 0) return 1;
            if (b.tempo === 0) return -1;
            return a.tempo - b.tempo;
        });

        // Renderiza a tabela
        body.innerHTML = "";
        listaRanking.forEach((item, index) => {
            // Verifica se deve mostrar a coluna "Ação" (apenas no Admin)
            const thAcao = document.querySelector('th:nth-child(5)');
            let tdAcao = "";
            if (thAcao) {
                // Só mostra botão de excluir se houver algo registrado
                tdAcao = (item.pontos > 0 || item.tempo > 0)
                    ? `<td><button class="btn-del" onclick="excluirEquipe('${item.equipe}')">Excluir</button></td>`
                    : "<td>---</td>";
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
    if (confirm("Excluir pontuação de " + nome + "? (Ela voltará a ficar zerada)")) {
        db.ref('ranking/' + nome).remove();
    }
}

function zerarRanking() {
    if (confirm("ATENÇÃO: Você vai apagar TODA a competição. Confirmar?")) {
        db.ref('ranking').remove();
    }
}

function resetForm() {
    curvas = 0;
    if (document.getElementById('curvas-val')) document.getElementById('curvas-val').innerText = 0;
    document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
    document.querySelectorAll('input[type=number]').forEach(el => el.value = "");
    if (document.getElementById('total')) document.getElementById('total').innerText = 0;
    calculate(); // Garante o total 0
}
