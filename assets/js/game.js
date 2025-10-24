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

    isColission (element) {
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
        super(game);
        this.w = 60
        this.h = 60
        this.y = innerHeight - this.h - $('.floor').getBoundingClientRect().height
        this.x = 1270
        this.createElement()
    }

    update() {
        if(this.isColission(this.game.player)) {
            setTimeout(() => {
                this.game.hp -= 5
                console.log("-hp")
            },1000)

        }
        super.update()
    }

}


class Mushroom extends Enemy {
    constructor(game) {
        super(game);
    }

    update() {
        if (this.x === 1270) this.offsets.x = 5
        else if (this.x === 1770) this.offsets.x = -5
        super.update()
    }
}

class Turtle extends Enemy {
    constructor(game) {
        super(game);
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
            Space: false
        }
        this.runInterval = null
        this.running = false
        this.currentFrame = 0
        this.frames = ['run1', 'run2']
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
        if((code in this.keys)) this.keys[code] = value
    }

    updateAnimation(side) {
        if (this.running) return
        this.running = true
        this.runInterval = setInterval(() => {
            const prevFrame = this.frames[(this.currentFrame + 1) % this.frames.length]
            this.element.classList.remove(prevFrame)

            const currentFrame = this.frames[this.currentFrame]
            this.element.classList.add(currentFrame)
            this.element.classList.add(side)

            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        },100)
    }

    stopAnimation() {
        this.running = false
        clearInterval(this.runInterval)
        this.runInterval = null
        this.element.classList.remove('reverse', 'run1', 'run2')
    }


    update() {
        let animation = $('.player')
        if (this.keys.ArrowLeft && this.x >= 0) {
            this.offsets.x = -this.speedPerFrame
            this.updateAnimation("reverse")
        }
        else if (this.keys.ArrowRight) {
            this.offsets.x = this.speedPerFrame
            this.updateAnimation()
        }
        else {
            this.offsets.x = 0
            animation.className = 'element player ' + this.character
            this.stopAnimation()
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
        this.enemies = [Mushroom, Turtle]
        this.player = this.generate(Player)
        this.enemy = this.generate(Mushroom)
        this.enemy = this.generate(Turtle)
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