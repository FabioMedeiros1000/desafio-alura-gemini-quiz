// Seleciona o elemento HTML onde as perguntas serão exibidas
let sectionPerguntas = document.getElementById("perguntas");
// Contador para acompanhar o número de perguntas feitas
let contadorPerguntas = 1;
// Contador de acertos do jogador
let qtdAcertos = 0;
// Lista para armazenar os índices das perguntas já sorteadas, evitando repetição
let perguntasSorteadas = [];
// Variável global para armazenar a categoria selecionada
let categoriaGlobal;
// Tempo máximo para responder cada pergunta
let tempoMaximo = 20;
// Variável que armazenará o ID do intervalo de tempo (usado para a contagem regressiva)
let intervalID;

// Objeto que armazena os áudios para diferentes eventos do quiz
const audio = {
    principal: new Audio('audios/principal.mp3'),
    acerto: new Audio('audios/acerto.mp3'),
    erro: new Audio('audios/erro.mp3')
};

// Objeto contendo os dados das perguntas de várias categorias
const categorias = {
    ciencia: dadosCiencia,
    filmes: dadosFilmes,
    futebol: dadosFutebol,
    musica: dadosMusica
};

// Função principal que carrega as perguntas de uma categoria específica
function pesquisaPergunta(categoria) {
    // Define a categoria selecionada como global para uso em outras funções
    categoriaGlobal = categoria;
    // Mostra a seção de perguntas
    mostrarElemento(sectionPerguntas);
    // Esconde a seção de seleção de categorias
    esconderElemento(document.getElementById("seleciona-categorias"));

    // Obtém todas as perguntas da categoria selecionada
    const perguntasCategoria = categorias[categoria];
    // Sorteia um índice aleatório para selecionar uma pergunta que ainda não foi usada
    const indiceAleatorio = sorteiaIndiceUnico(perguntasCategoria.length);
    // Seleciona a pergunta sorteada
    const perguntaSelecionada = perguntasCategoria[indiceAleatorio];

    // Exibe a pergunta na tela
    exibePergunta(perguntaSelecionada);
}

// Sorteia um índice único (não repetido) para as perguntas
function sorteiaIndiceUnico(tamanhoArray) {
    let indiceAleatorio;
    // Gera um número aleatório até que seja um índice ainda não sorteado
    do {
        indiceAleatorio = Math.floor(Math.random() * tamanhoArray);
    } while (perguntasSorteadas.includes(indiceAleatorio));
    
    // Adiciona o índice à lista de perguntas já sorteadas
    perguntasSorteadas.push(indiceAleatorio);
    return indiceAleatorio;
}

// Função que exibe a pergunta selecionada e suas alternativas na tela
function exibePergunta(pergunta) {
    sectionPerguntas.innerHTML = `
        <div class="pergunta-container">
            <h3 class="pergunta-titulo">Pergunta ${contadorPerguntas}</h3>
            <p class="pergunta-enunciado">${pergunta.pergunta}</p>
            <div class="respostas">
                ${pergunta.alternativas.map((alternativa, indice) => 
                    criarBotaoAlternativa(indice, pergunta.respostaIndex, alternativa)).join('')}
            </div>
            <span class="tempo-restante" id="tempo-restante">${tempoMaximo}s</span>
        </div>
    `;
    // Incrementa o contador de perguntas
    contadorPerguntas++;
    // Inicia a contagem regressiva para responder a pergunta
    iniciarContagem(pergunta.respostaIndex);
}

// Função que cria os botões de alternativas para cada pergunta
function criarBotaoAlternativa(indice, respostaCorreta, alternativa) {
    return `<button onclick="verificaResposta(${indice}, ${respostaCorreta})" class="resposta-item" id="resposta-item-${indice}">${alternativa}</button>`;
}

// Verifica se a resposta selecionada pelo usuário está correta
function verificaResposta(indiceClicado, indiceCorreto) {
    // Para o intervalo de tempo (contagem regressiva)
    clearInterval(intervalID);
    // Para todos os áudios que possam estar tocando
    pararTodosAudios();

    // Seleciona todos os botões de alternativas
    const botoes = document.querySelectorAll('.resposta-item');
    botoes.forEach(botao => {
        botao.disabled = true; // Desabilita todos os botões após a resposta
        botao.classList.add('resposta-item-desativado'); // Remove interatividade visual
    });

    // Verifica se a resposta clicada está correta
    const acertou = indiceClicado === indiceCorreto;
    const resultado = acertou ? "Parabéns! Resposta correta!" : "Resposta errada!";
    
    // Marca as alternativas corretas/incorretas visualmente
    marcaAlternativa(indiceCorreto, indiceClicado, acertou);
    // Toca o áudio correspondente à resposta
    tocarAudio(acertou ? 'acerto' : 'erro');
    
    // Incrementa o contador de acertos se a resposta estiver correta
    if (acertou) qtdAcertos++;

    // Exibe o feedback para o jogador
    exibeFeedback(resultado);
    // Exibe o botão para a próxima pergunta ou para ver o resultado final
    exibeBotaoProximaPergunta();
}

// Marca a resposta correta ou incorreta visualmente
function marcaAlternativa(indiceCorreto, indiceClicado, acertou) {
    const respostaCerta = document.getElementById(`resposta-item-${indiceCorreto}`);
    // Define a cor verde para a resposta correta
    respostaCerta.style.backgroundColor = "#4CAF50";
    respostaCerta.style.color = "#FFFFFF";

    // Se o jogador clicou em uma alternativa errada, marca em vermelho
    if (indiceClicado >= 0) {
        const respostaClicada = document.getElementById(`resposta-item-${indiceClicado}`);
        if (!acertou) {
            respostaClicada.style.backgroundColor = "#F44336"; // Vermelho para incorreto
            respostaClicada.style.color = "#FFFFFF"; // Texto branco
        }
    }
}

// Exibe a mensagem de feedback (acertou ou errou)
function exibeFeedback(mensagem) {
    sectionPerguntas.innerHTML += `<p class="resultado-resposta">${mensagem}</p>`;
}

// Exibe o botão para a próxima pergunta ou para ver o resultado final
function exibeBotaoProximaPergunta() {
    const botao = contadorPerguntas <= 5
        ? `<button class="btn-proxima-pergunta" onclick="pesquisaPergunta('${categoriaGlobal}')">Próxima pergunta</button>`
        : `<button class="btn-ver-resultado" onclick="exibeQtdAcertos()">Ver resultado</button>`;
    
    sectionPerguntas.innerHTML += botao;
}

// Exibe a quantidade de acertos no final do quiz
function exibeQtdAcertos() {
    sectionPerguntas.innerHTML = `
        <h3 class="resultado-final-titulo">Seu resultado</h3>
        <p>Você acertou ${qtdAcertos} de 5</p>
    `;
    // Para todos os áudios
    pararTodosAudios();
    // Reseta o quiz para jogar novamente
    resetarQuiz();
}

// Reseta o quiz para as condições iniciais
function resetarQuiz() {
    contadorPerguntas = 1;
    perguntasSorteadas = [];
    qtdAcertos = 0;
    mostrarElemento(document.getElementById("seleciona-categorias"));
}

// Inicia a contagem regressiva para responder a pergunta
function iniciarContagem(indiceCorreto) {
    let tempoRestante = tempoMaximo;
    const tempoElemento = document.getElementById("tempo-restante");

    // Limpa qualquer intervalo anterior
    clearInterval(intervalID);
    // Toca o áudio principal
    tocarAudio('principal');

    // Inicia o intervalo de contagem regressiva
    intervalID = setInterval(() => {
        tempoRestante--;
        tempoElemento.textContent = `${tempoRestante}s`;

        if (tempoRestante <= 0) {
            clearInterval(intervalID); // Para a contagem quando o tempo acaba
            pararTodosAudios();
            exibeFeedback("Tempo esgotado!"); // Mostra que o tempo acabou

            // Desabilita os botões de resposta ao fim do tempo
            const botoes = document.querySelectorAll('.resposta-item');
            botoes.forEach(botao => {
                botao.disabled = true;
                botao.classList.add('resposta-item-desativado');
            });

            // Marca a resposta correta automaticamente ao fim do tempo
            marcaAlternativa(indiceCorreto, -1, false); // Sem clique (-1)

            // Exibe o botão para a próxima pergunta
            exibeBotaoProximaPergunta();
        }
    }, 1000); // Intervalo de 1 segundo
}

// Função para tocar o áudio conforme o evento
function tocarAudio(tipo) {
    pararTodosAudios(); // Para qualquer áudio em execução
    audio[tipo].currentTime = 0; // Reseta o tempo do áudio
    audio[tipo].play(); // Toca o áudio
}

// Função para parar todos os áudios
function pararTodosAudios() {
    Object.values(audio).forEach(a => {
        a.pause(); // Pausa o áudio
        a.currentTime = 0; // Reseta o tempo para o início
    });
}

// Função para mostrar elementos na tela
function mostrarElemento(elemento) {
    elemento.style.display = "block";
}

// Função para esconder elementos na tela
function esconderElemento(elemento) {
    elemento.style.display = "none";
}
