// Cria um novo elemento no DOM
function novoElemento(nomeDaTag, nomeDaClasse) {
    this.elemento = document.createElement(nomeDaTag)
    this.elemento.className = nomeDaClasse
    return this.elemento
}

// Cria uma barreira (se reversa = true, então criará a barreira de cima)
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    // Criar e adicionar o corpo e a borda na ordem correta
    this.corpo = novoElemento('div', 'corpo')
    this.borda = novoElemento('div', 'borda')
    this.elemento.appendChild(reversa ? this.corpo : this.borda)
    this.elemento.appendChild(reversa ? this.borda : this.corpo)

    // Altera a altura do corpo da barreira
    this.setAltura = altura => this.corpo.style.height = `${altura}px`
}

// Cria um par de barreiras: uma em cima (reversa) e outra em baixo (normal)
function ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, posicaoX) {
    this.elemento = novoElemento('div', 'parDeBarreiras')

    // Posição inicial
    this.elemento.style.left = `${posicaoX}px`

    // Cria uma barreira superior, outra inferior e as insere no par de barreiras
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    // Acessa a posição do par de barreiras no eixo X
    this.getX = e => parseInt(this.elemento.style.left.split('px')[0])

    // Modifica a posição do par de barreiras no eixo X
    this.setX = posicaoX => this.elemento.style.left = `${posicaoX}px`

    // Sorteia a altura da barreira superior e inferior, deixando sempre a abertura com espaçamento igual
    this.sortearAltura = () => {
        const alturaSuperior = Math.random() * (alturaDoJogo - aberturaEntreBarreiras)
        const alturaInferior = alturaDoJogo - alturaSuperior - aberturaEntreBarreiras
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    // Verifica se o meio do par de barreiras ultrapassou o meio do jogo
    this.cruzouOMeio = () => {
        const ultrapassouOMeioDaBarreira = this.getX() < (450 - this.elemento.clientWidth / 2)
        const acabouDeUltrapassarOMeioDaBarreira = this.getX() + 1 >= (450 - this.elemento.clientWidth / 2)

        if (ultrapassouOMeioDaBarreira && acabouDeUltrapassarOMeioDaBarreira) {
            return true
        } else {
            return false
        }
    }

    // Acessa a largura/width do par de barreiras
    this.getLargura = () => this.elemento.clientWidth
}

// Cria 4 pares de barreiras e os faz mover para a esquerda, gerando a animação
function ParesDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, espacoEntreParesDeBarreiras, posicaoX) {
    this.pares = [
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, posicaoX),
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, posicaoX + espacoEntreParesDeBarreiras),
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, posicaoX + espacoEntreParesDeBarreiras * 2),
        new ParDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, posicaoX + espacoEntreParesDeBarreiras * 3)
    ]

    /*
    * Move os pares de barreiras para a esquerda e os posiciona para a última colocação 
    * quando saem da tela, criando um loop.
    * 
    * A posição da abertura entre as barreiras é sorteada toda vez que voltam para a última posição.
    */
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - 1)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espacoEntreParesDeBarreiras * 4)
                par.sortearAltura()
            }
        })
    }

    this.pares.forEach(par => par.sortearAltura())
}

// Cria o avião que o usuário controlará
function Aviao(alturaDoJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'aviao')
    this.elemento.src = 'images/aviaof35.png'

    window.onkeydown = () => voando = true
    window.onkeyup = () => voando = false

    // Acessa a posição do eixo Y do avião
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])

    // Modifica a posição do eixo Y do avião
    this.setY = y => this.elemento.style.bottom = `${y}px`

    this.setY(250)

    // Controla a posição Y do avião durante o jogo, sendo o jogador o responsável por fazê-lo subir ou descer
    this.animar = () => {
        const alturaMaxima = alturaDoJogo - this.elemento.clientHeight
        const alturaMinima = 0
        
        if (voando === true) {
            if (this.getY() >= alturaMaxima) {
                this.setY(alturaMaxima)
            } else {
                this.setY(this.getY() + 2)
            }
        } else if (voando === false) {
            if (this.getY() <= alturaMinima) {
                this.setY(alturaMinima)
            } else {
                this.setY(this.getY() - 2)
            }
        }
    }
}

// Verifica se o avião ou alguma barreira colidiram
function colidiu(elementoA, elementoB) {
    let eleA = elementoA.getBoundingClientRect()
    let eleB = elementoB.getBoundingClientRect()

    let colisaoVertical = eleA.bottom >= eleB.top
        && eleA.top <= eleB.bottom

    let colisaoHorizontal = eleA.left <= eleB.right
        && eleA.right >= eleB.left

    return colisaoHorizontal && colisaoVertical
}

// Cria o placar de pontuação do jogo
function Pontuacao(paresDeBarreiras) {
    this.elemento = novoElemento('p', 'pontuacao')
    this.elemento.innerText = '0'

    let contagem = 0

    // Aumenta a pontuação em 1 toda vez que um par de barreiras passa do meio da tela
    this.contar = () => {
        paresDeBarreiras.pares.forEach(par => {
            if (par.cruzouOMeio()) {
                ++contagem
                this.elemento.innerText = `${contagem}`
            }
        })
    }
}

function iniciarJogo(alturaDoJogo = 500, aberturaEntreBarreiras = 150, espacoEntreParesDeBarreiras = 350, posicaoX = 900) {
    const areaDoJogo = document.querySelector('.areaDoJogo')
    removerTodosOsFilhos(areaDoJogo)

    const aviao = new Aviao(alturaDoJogo)
    const paresDeBarreiras = new ParesDeBarreiras(alturaDoJogo, aberturaEntreBarreiras, espacoEntreParesDeBarreiras, posicaoX)

    paresDeBarreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    areaDoJogo.appendChild(aviao.elemento)

    const pontuacao = new Pontuacao(paresDeBarreiras)
    areaDoJogo.appendChild(pontuacao.elemento)

    const loopDoJogo = () => {
        aviao.animar()
        paresDeBarreiras.animar()
        pontuacao.contar()
        verificarColisaoEPararJogo()
    }

    // Faz a animação do jogo acontecer
    const jogo = setInterval(loopDoJogo, 7)

    const verificarColisaoEPararJogo = () => {
        paresDeBarreiras.pares.forEach(par => {
            let colidiuComBarreiraSuperior = colidiu(aviao.elemento, par.superior.elemento)
            let colidiuComBarreiraInferior = colidiu(aviao.elemento, par.inferior.elemento)

            if (colidiuComBarreiraSuperior || colidiuComBarreiraInferior) {
                clearInterval(jogo)
                reiniciarJogo()
            }
        })
    }

    function reiniciarJogo() {
        areaDoJogo.style.backgroundImage = 'radial-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(images/skyPixelart.jpg)'

        const textoReiniciarJogo = novoElemento('p', 'textoReiniciarJogo')
        textoReiniciarJogo.innerHTML = 'Que pena!<br>Aperte [ ESPAÇO ] para reiniciar o jogo.'
        areaDoJogo.appendChild(textoReiniciarJogo)

        window.onkeydown = e => {
            if (e.key === ' ') {
                areaDoJogo.style.backgroundImage = 'radial-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url(images/skyPixelart.jpg)'
                iniciarJogo()
            }
        }
    }

    // Eu poderia apenas usar innerHTML = '' para resetar o jogo, mas usar uma função é bem mais legal kk
    function removerTodosOsFilhos(elementoPai) {
        while (elementoPai.firstChild) {
            elementoPai.removeChild(elementoPai.firstChild)
        }
    }
}

const botaoComecar = document.querySelector('.botaoComecar')
botaoComecar.addEventListener('click', () => iniciarJogo())