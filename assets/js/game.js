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
            ArrowUp: false
        }
        this.runInterval = null
        this.currentRunFrame = 1
        this.isJumping = false
        this.jumpVelocity = 0
        this.jumpPower = 22
        this.gravity = 0.5
        this.createElement()
        this.bindKeyEvents()
        this.setCharacter()
    }

    setCharacter() {
        $('.player').classList.add(`${this.character}`)
    }

    startRunAnimation() {
        if (this.runInterval) return
        this.runInterval = setInterval(() => {
            this.currentRunFrame = this.currentRunFrame === 1 ? 2 : 1
            const animation = $('.player')
            animation.classList.remove('run1', 'run2', 'run1l', 'run2l')
            
            if (this.character === 'mario') {
                animation.classList.add(`run${this.currentRunFrame}`)
            } else if (this.character === 'luigi') {
                animation.classList.add(`run${this.currentRunFrame}l`)
            }
        }, 100)
    }

    stopRunAnimation() {
        if (this.runInterval) {
            clearInterval(this.runInterval)
            this.runInterval = null
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true
            this.jumpVelocity = -this.jumpPower
            this.stopRunAnimation()
        }
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

        if (this.keys.ArrowUp && !this.isJumping) {
            this.jump()
        }

        if (this.isJumping) {
            this.offsets.y = this.jumpVelocity
            this.jumpVelocity += this.gravity

            const floorY = innerHeight - $('.floor').getBoundingClientRect().height
            if (this.y + this.h >= floorY) {
                this.y = floorY - this.h - 1
                this.isJumping = false
                this.jumpVelocity = 0
                this.offsets.y = 0
            }
        } else {
            this.offsets.y = 0
        }
        
        if (!this.isJumping) {
            if (this.keys.ArrowLeft && this.x >= 0) {
                this.offsets.x = -this.speedPerFrame
                this.startRunAnimation()
                animation.classList.add('reverse')
            }
            else if (this.keys.ArrowRight) {
                this.offsets.x = this.speedPerFrame
                this.startRunAnimation()
                animation.classList.remove('reverse')
            }
            else {
                this.offsets.x = 0
                this.stopRunAnimation()
                animation.className = 'element player ' + this.character
            }
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