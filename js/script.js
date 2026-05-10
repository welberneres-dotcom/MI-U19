// ... (mantenha suas configurações de Firebase e EQUIPES_LISTA aqui no topo)

// FUNÇÃO PARA EXCLUIR UMA PONTUAÇÃO ESPECÍFICA
function excluirEquipe(nome) {
    if (confirm(`Deseja realmente excluir a pontuação de ${nome}?`)) {
        db.ref('ranking/' + nome).remove()
            .then(() => alert("Pontuação removida!"))
            .catch(e => alert("Erro ao excluir: " + e.message));
    }
}

// FUNÇÃO PARA ZERAR TODO O RANKING
function zerarRanking() {
    if (confirm("ATENÇÃO: Isso apagará TODAS as pontuações da competição! Confirmar?")) {
        db.ref('ranking').remove()
            .then(() => alert("Competição zerada com sucesso!"))
            .catch(e => alert("Erro ao zerar: " + e.message));
    }
}

// AJUSTE NA FUNÇÃO DE CARREGAR PARA INCLUIR O BOTÃO DE EXCLUIR
function carregarFirebase() {
    const body = document.getElementById('ranking-body');
    if (!body) return;

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
            // Só mostra o botão de excluir se a equipe tiver pontos ou tempo registrados
            const btnExcluir = (item.pontos > 0 || item.tempo > 0) 
                ? `<button class="btn-del" onclick="excluirEquipe('${item.equipe}')">Excluir</button>` 
                : "---";

            body.innerHTML += `
                <tr>
                    <td class="posicao"><b>${index + 1}º</b></td>
                    <td style="text-align: left; font-weight: bold;">${item.equipe}</td>
                    <td class="pts">${item.pontos}</td>
                    <td>${item.tempo > 0 ? item.tempo + 's' : '---'}</td>
                    <td>${btnExcluir}</td>
                </tr>`;
        });
    });
}
