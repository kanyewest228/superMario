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
                    this.game.points += 100
                    this.game.kills += 1
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
        this.w = 70
        this.h = 70
        this.x = innerWidth / 3
        this.y = innerHeight / 2 + 50
        this.createElement()
    }


    collisionTop(element) {
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
        
        if (b.x1 < a.x2 && b.x2 > a.x1) {
            if (b.y2 > a.y1 && b.y2 < a.y1 + 20 && element.offsets.y > 0) {
                element.y = a.y1 - element.h
                element.isJumping = false
                element.jumpVelocity = 0
                element.offsets.y = 0
                return true
            }
        }
        return false
    }

    collisionBottom(element) {
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
        
        if (b.x1 < a.x2 && b.x2 > a.x1) {
            if (b.y1 < a.y2 && b.y1 > a.y2 - 20 && element.offsets.y < 0) {
                element.y = a.y2
                element.jumpVelocity = 0
                element.offsets.y = 0
                return true
            }
        }
        return false
    }

    collisionSide(element) {
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
        if (b.y1 < a.y2 && b.y2 > a.y1) {
            if (b.x2 > a.x1 && b.x2 < a.x1 + 20 && element.offsets.x > 0) {
                element.x = a.x1 - element.w
                element.offsets.x = 0
                return true
            }
            if (b.x1 < a.x2 && b.x1 > a.x2 - 20 && element.offsets.x < 0) {
                element.x = a.x2
                element.offsets.x = 0
                return true
            }
        }
        return false
    }

    collisionPlatform() {
        this.collisionTop(this.game.player)
        this.collisionBottom(this.game.player)
        this.collisionSide(this.game.player)
    }

    update() {
        this.collisionPlatform()
        super.update()
    }
}


class Player extends Drawable {
    constructor(game) {
        super(game)
        this.w = 80
        this.h = 114
        this.x = 10
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
            let standingOnPlatform = false
            this.game.elements.forEach(element => {
                if (element instanceof Platform) {
                    if (this.x + this.w > element.x && this.x < element.x + element.w &&
                        this.y + this.h >= element.y - 5 && this.y + this.h <= element.y + 5) {
                        standingOnPlatform = true
                    }
                }
            })
        
            const floorY = innerHeight - $('.floor').getBoundingClientRect().height
            if (!standingOnPlatform && this.y + this.h < floorY) {
                this.isJumping = true
                this.jumpVelocity = 0
            } else {
                this.offsets.y = 0
            }
        }

        if (this.keys.ArrowLeft && this.x >= 0) {
            this.offsets.x = -this.speedPerFrame
            if (!this.isJumping) {
                this.startRunAnimation()
                animation.classList.add('reverse')
                animation.classList.add('run1')
            }
        } else if (this.keys.ArrowRight) {
            this.offsets.x = this.speedPerFrame
            if (!this.isJumping) {
                this.startRunAnimation()
                animation.classList.remove('reverse')
                animation.classList.add('run1')
            }

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
        this.kills = 0
        this.counterForTimer = 0
        this.enemies = [Gump, Turtle]
        this.player = this.generate(Player)
        this.platformX = [800, 870, 940, 1010, 1080, 1640, 1710, 1780, 2340, 2410, 2480, 2550]
        this.enemies.forEach((enemy) => {
            return this.generate(enemy)
        })
        this.platformX.forEach((x) => {
            let el = this.generate(Platform)
            let ind = this.elements.lastIndexOf(el)
            this.elements[ind].x = x
        })
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
                document.querySelectorAll('.element').forEach(el => {
                    if(!el.classList.contains('platform')) el.style.animationPlayState = 'running'
                })
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