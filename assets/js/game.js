class Drawable {
    constructor(game) {
        this.game = game
        this.x = 0
        this.y = 0
        this.w = 0
        this.h = 0
        this.offsets = {
            x: 0,
            y: 0
        }
        this.character = character || 'mario'
    }

    createElement() {
        this.element = document.createElement('div')
        this.element.className = 'element ' + this.constructor.name.toLowerCase()
        $('.elements').append(this.element)
    }

    update() {
        this.x += this.offsets.x
        this.y += this.offsets.y
    }

    draw () {
        this.element.style = `
            left: ${this.x}px;
            top: ${this.y}px;
            width: ${this.w}px;
            height: ${this.h}px;
        `
    }

    removeElement() {
        this.element.remove()
    }
}


// class Floor extends Drawable {
//     constructor(game) {
//         super(game);
//     }
// }

class Player extends Drawable {
    constructor(game) {
        super(game);
        this.w = 80
        this.h = 114
        this.x = innerWidth / 4 - this.w / 2
        this.y = innerHeight - this.h - $('.floor').getBoundingClientRect().height
        this.speedPerFrame = 10
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        }
        this.createElement()
        this.bindKeyEvents()
        this.setCharacter()
    }

    setCharacter() {
        $('.player').classList.add(`${this.character}`)
    }


    bindKeyEvents() {
        document.addEventListener('keydown', e => this.changeKeyStatus(e.code, true))
        document.addEventListener('keyup', e => this.changeKeyStatus(e.code, false))
    }

    changeKeyStatus(code, value) {
        if(code in this.keys) this.keys[code] = value
    }


    update() {
        let animation = $('.player')
        if (this.keys.ArrowLeft && this.x >= 0) {
            this.offsets.x = -this.speedPerFrame
            animation.classList.add(`run1`, 'reverse')
        }
        else if (this.keys.ArrowRight) {
            this.offsets.x = this.speedPerFrame
            animation.classList.add(`run1`)
        }
        else {
            this.offsets.x = 0
            animation.className = 'element player ' + this.character
        }

        super.update()
    }
}

class Game {
    constructor() {
        this.name = name
        this.elements = []
        this.hp = 20
        this.points = 0
        this.player = this.generate(Player)
        this.time = {
            m1: 0,
            m2: 0,
            s1: 0,
            s2: 0
        }
        this.ended = false
        this.pause = false
        this.keyEvents()
    }

    start() {
        this.loop()
    }

    generate(className) {
        let element = new className(this)
        this.elements.push(element)
        return element
    }

    loop() {
        requestAnimationFrame(() => {
            if(!this.pause) {
                this.counterForTimer++
                if (this.counterForTimer % 75 === 0) {
                    this.timer()
                }
                if (this.hp < 1) this.end()
                $('.pause').style.display = 'none'
                document.querySelectorAll('.element').forEach(el => el.style.animationPlayState = 'running')
                this.updateElements()
                this.setParams()
            } else if(this.pause) {
                $('.pause').style.display = 'flex'
                document.querySelectorAll('.element').forEach(el => el.style.animationPlayState = 'paused')
            }
            if(!this.ended) this.loop()
        })
    }

    setParams() {
        let params = ['name', 'points', 'hp']
        let values = [this.name, this.points, this.hp]
        params.forEach((param, ind) => {
            $(`#${param}`).innerHTML = values[ind]
        })
    }

    keyEvents() {
        addEventListener('keydown', ev => {
            if(ev.code === 'Escape') this.pause = !this.pause
        })
    }

    updateElements() {
        this.elements.forEach((el) => {
            el.update()
            el.draw()
        })
    }



}