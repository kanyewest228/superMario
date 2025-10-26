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

    isCollision (element) {
        let a = {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.w,
            y2: this.y + this.h
        }
        let b = {
            x1: element.x,
            y1: element.y,
            x2: element.x + element.w,
            y2: element.y + element.h
        }

        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2
    }
}


class Enemy extends Drawable {
    constructor(game) {
        super(game)
        this.w = 60
        this.h = 60
        this.y = innerHeight - this.h - $('.floor').getBoundingClientRect().height
        this.x = 1270
        this.lastDamageFrame = 0
        this.damageCooldown = 30
        this.createElement()
    }

    update() {
        if (this.offsets.x !== 0 && this.x > 0 && this.x < innerWidth) {
            if(this.isCollision(this.game.player)) {
                if (this.game.player.isJumping && this.game.player.jumpVelocity > 0 && 
                    this.game.player.y + this.game.player.h <= this.y + 20) {
                    this.game.points += 1
                    this.removeElement()
                    const index = this.game.elements.indexOf(this)
                    if (index > -1) {
                        this.game.elements.splice(index, 1)
                    }
                    return
                }
                if (this.game.counterForTimer - this.lastDamageFrame >= this.damageCooldown) {
                    this.game.hp -= 2
                    this.lastDamageFrame = this.game.counterForTimer
                }
            }
        }
        super.update()
    }

}


class Gump extends Enemy {
    constructor(game) {
        super(game)
    }

    update() {
        if (this.x === 1270) this.offsets.x = 5
        else if (this.x === 1770) this.offsets.x = -5
        super.update()
    }
}

class Turtle extends Enemy {
    constructor(game) {
        super(game)
    }
}

class Platform extends Drawable {
    constructor(game) {
        super(game)
        this.w = 200
        this.h = 20
        this.x = 0
        this.y = 0
        this.createElement()
    }
}


class Player extends Drawable {
    constructor(game) {
        super(game)
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
        this.runInterval = null
        this.running = false
        this.currentRunFrame = 1
        this.jumpVelocity = 2
        this.jumpPower = 19
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
        
        const animation = $('.player')
        animation.classList.remove('run1', 'run2', 'run1l', 'run2l')
        
        if (this.character === 'mario') {
            animation.classList.add(`run${this.currentRunFrame}`)
        } else if (this.character === 'luigi') {
            animation.classList.add(`run${this.currentRunFrame}l`)
        }
        
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
        if((code in this.keys)) this.keys[code] = value
    }


    update() {
        let animation = $('.player')
        if (this.keys.Space && !this.isJumping) {
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
            animation.classList.remove('run1', 'run2', 'run1l', 'run2l', 'reverse')
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
        this.counterForTimer = 0
        this.enemies = [Gump, Turtle]
        this.player = this.generate(Player)
        this.enemies.forEach((enemy) => {
            return this.generate(enemy)
        })
        this.platform = this.generate(Platform)
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

    timer() {
        let time = this.time
        time.s2++
        if(time.s2 >= 10) {
            time.s1++
            time.s2 = 0
        }
        if(time.s1 >= 6) {
            time.m2++
            time.s1 = 0
        }
        if(time.m2 >= 10) {
            time.m2 = 0
            time.m1++
        }
        $('#timer').innerHTML = `${time.m1}${time.m2}:${time.s1}${time.s2}`
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

    end() {
        this.ended = true
        this.hp = 20
        this.points = 0

    }

}