 // COLE AQUI AS CONFIGURAÇÕES DO SEU PROJETO FIREBASE
  const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "12345",
    appId: "1:12345:web:abcde"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

let curvas = 0;
// Função para carregar e organizar o Ranking em tempo real
function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if(!body) return;

    // O ".on('value', ...)" faz a mágica do tempo real (atualiza sem dar F5)
    db.ref('ranking/').on('value', (snapshot) => {
        const dados = snapshot.val();
        let lista = [];

        // Transforma o objeto do Firebase em uma lista que podemos ordenar
        for (let id in dados) {
            lista.push(dados[id]);
        }

        // ORDENAÇÃO: 1º Pontos (Maior para menor), 2º Tempo (Menor para maior)
        lista.sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            return a.tempo - b.tempo;
        });

        // LIMPA A TABELA ANTES DE REESCREVER
        body.innerHTML = "";

        // GERA AS LINHAS COM OS NOMES DAS EQUIPES
        lista.forEach((item, index) => {
            body.innerHTML += `
                <tr>
                    <td class="posicao"><b>${index + 1}º</b></td>
                    <td style="text-align: left; font-weight: bold;">${item.equipe}</td>
                    <td class="pts">${item.pontos}</td>
                    <td>${item.tempo}s</td>
                </tr>`;
        });
    });
}




function updateCurvas(val) {
    curvas = Math.max(0, curvas + val);
    document.getElementById('curvas-val').innerText = curvas;
    calculate();
}

function calculate() {
    let total = 0;

    // Missões Iniciais
    if(document.getElementById('item1').checked) total += 50;
    if(document.getElementById('item2').checked) total += 80;

    // Navegação
    total += (curvas * 20);

    // Depósito
    const deposito = document.querySelector('input[name="deposito"]:checked').value;
    total += parseInt(deposito);

    // Bônus
    if(document.getElementById('bonus1').checked) total += 50;
    if(document.getElementById('bonus2').checked) total += 100;

    document.getElementById('total').innerText = total;
}

function salvarPontuacao() {
    const equipe = document.getElementById('equipe-select').value;
    const tempo = parseInt(document.getElementById('tempo-input').value);
    const pontos = parseInt(document.getElementById('total').innerText);

    if (isNaN(tempo) || tempo <= 0) {
        alert("Por favor, digite o tempo da prova em segundos!");
        return;
    }

    let ranking = JSON.parse(localStorage.getItem('ranking_robotica')) || [];

    // Adiciona o novo registro
    ranking.push({ equipe, pontos, tempo });

    // Salva no navegador
    localStorage.setItem('ranking_robotica', JSON.stringify(ranking));

    alert(`Sucesso! ${equipe}: ${pontos} pontos em ${tempo}s.`);
    resetForm();
}

function resetForm() {
    curvas = 0;
    document.getElementById('curvas-val').innerText = 0;
    document.getElementById('item1').checked = false;
    document.getElementById('item2').checked = false;
    document.getElementById('bonus1').checked = false;
    document.getElementById('bonus2').checked = false;
    document.getElementById('tempo-input').value = "";
    document.querySelectorAll('input[name="deposito"]').forEach(r => r.checked = r.value == "0");
    calculate();
}
