let name = ''
let panel ='start'
let $ = (element) => document.querySelector(element);

let nav = () => {
    document.onclick = (e) => {
        e.preventDefault();
        switch(e.target.id){
            case 'startGame':
                go('game', 'df')
                break
        }
    }
}

let go = (page, attribute) => {
    let pages = ['start', 'game', 'end']
    panel = page
    $(`#${page}`).setAttribute('class', attribute)
    pages.forEach(el => {
        if(page !== el) $(`#${el}`).setAttribute('class', 'dn')
    })
}

let checkName = () => {
    name = $('#nameInput').value.trim()
    if(name !== '') {
        localStorage.setItem('userName', name)
        $('#startGame').removeAttribute('disabled')
    } else {
        $('#startGame').setAttribute('disabled', '')
    }
}

let checkStorage = () => {
    $('#nameInput').value = localStorage.getItem('userName') || ''
}

let startLoop = () => {
    let inter = setInterval(() => {
        checkName()
        if(panel !== 'start') clearInterval(inter)
    }, 100)
}

window.onload = () => {
    checkStorage()
    nav()
    startLoop()
    startGame()
}

let startGame = () => {
    let inter = setInterval(() => {
        if(panel === 'game') {
            game = new Game()
            game.start()
            panel = 'game process'
            clearInterval(inter)
        }
    }, 500)
}