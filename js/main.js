let ninja
let ninjaGravity = 800
let ninjaJumpPower
let score = 0
let scoreText
let topScore
let powerBar
let powerTween
let placedPoles
let poleGroup
let poleGap = {
    min: 100, max: 200
}
let ninjaJumping
let ninjaFallingDown
let gameover
let bgColor

let GameState = {
    init: function () {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        this.scale.pageAlignHorizontally = true
        this.scale.pageAlignVertically = true
        this.game.physics.startSystem(Phaser.Physics.ARCADE)

        //Set the games background colour
        this.game.stage.backgroundColor = '#FFF'
        let myBitmap = this.game.add.bitmapData(this.game.width, this.game.height)
        bgColor = myBitmap.context.createLinearGradient(0, 0, 0, 500)
        this.generateGradients()
        myBitmap.context.fillStyle = bgColor
        myBitmap.context.fillRect(0, 0, this.game.width, this.game.height)

        let bitmapSprite = this.game.add.sprite(0, 0, myBitmap)
        bitmapSprite.alpha = 0
        this.game.add.tween(bitmapSprite).to({ alpha: 1 }, 1000).start()
    },
    preload: function () {
        this.load.image("ninja", "assets/images/ninja.png")
        this.load.image("pole", "assets/images/pole.png")
        this.load.image("powerbar", "assets/images/powerbar.png")
        this.load.image("gameover", "assets/images/gameover.png")
        this.load.bitmapFont("font", "assets/images/font.png", "assets/font/font.fnt")
        this.load.image('mountains-back', 'assets/images/mountains-back.png')
        this.load.image('mountains-mid1', 'assets/images/mountains-mid1.png')
        this.load.image('mountains-mid2', 'assets/images/mountains-mid2.png')
    },
    create: function () {
        ninjaJumping = false
        ninjaFallingDown = false
        score = 0
        placedPoles = 0

        this.mountainsBack = game.add.tileSprite(
            0,
            this.game.height - game.cache.getImage('mountains-back').height,
            this.game.width,
            this.game.cache.getImage('mountains-back').height,
            'mountains-back'
        )
        this.mountainsMid1 = game.add.tileSprite(
            0,
            this.game.height - game.cache.getImage('mountains-mid1').height,
            this.game.width,
            this.game.cache.getImage('mountains-mid1').height,
            'mountains-mid1'
        )
        this.mountainsMid2 = game.add.tileSprite(
            0,
            this.game.height - game.cache.getImage('mountains-mid2').height,
            this.game.width,
            this.game.cache.getImage('mountains-mid2').height,
            'mountains-mid2'
        )

        gameover = game.add.sprite(game.width / 2, game.height / 2, "gameover")
        gameover.anchor.setTo(0.5, 0.5)
        gameover.alpha = 0

        poleGroup = this.game.add.group()
        poleGroup.enableBody = true

        topScore = localStorage.getItem("jumper") == null ? 0 : localStorage.getItem("jumper")
        scoreText = game.add.bitmapText(10, 10, "font", "", 50)
        updateScore()

        ninja = this.game.add.sprite(80, 0, "ninja")
        ninja.anchor.set(0.5, 0.5)
        ninja.lastPole = 1
        ninja.angle = 0
        game.physics.arcade.enable(ninja)
        ninja.body.gravity.y = ninjaGravity
        let ninjaTween = game.add.tween(ninja).to({ angle: 360 }, 1300, "Linear", true)
        ninjaTween.onComplete.add(function () {
            game.camera.shake(0.015, 200)
        })

        game.input.onDown.add(prepareToJump, this)

        addPole(80)
        poleCreator = game.time.events.loop(Phaser.Timer.SECOND * 1, addNewPoles, this)
    },
    update: function () {
        game.physics.arcade.collide(ninja, poleGroup, checkLanding)
        if (ninja.y > game.height) {
            gameOver()
        }

        if (ninjaJumping && !ninjaFallingDown) {
            poleGroup.setAll("body.velocity.x", ninjaJumpPower)
        }
        else {
            poleGroup.setAll("body.velocity.x", 0)
        }

        if (ninjaJumping) {
            this.mountainsBack.tilePosition.x -= 0.05
            this.mountainsMid1.tilePosition.x -= 0.3
            this.mountainsMid2.tilePosition.x -= 0.75
        }
        else {
            this.mountainsBack.tilePosition.x -= 0.05
            this.mountainsMid1.tilePosition.x -= 0.05
            this.mountainsMid2.tilePosition.x -= 0.10
        }
    },
    generateGradients: function () {
        let colorArr = [
            { top: "#334d50", bottom: "#cbcaa5" }, // 0
            { top: "#00d2ff", bottom: "#928dab" }, // 1
            { top: "#2193b0", bottom: "#6dd5ed" }, // 2
            { top: "#373B44", bottom: "#4286f4" }, // 3
            { top: "#000000", bottom: "#434343" }, // 4 
            { top: "#8E2DE2", bottom: "#4A00E0" }, // 5
            { top: "#00b09b", bottom: "#96c93d" }, // 6
            { top: "#3C3B3F", bottom: "#605C3C" }, // 7
            { top: "#360033", bottom: "#0b8793" }, // 8
            { top: "#654ea3", bottom: "#eaafc8" }, // 9
            { top: "#6190E8", bottom: "#A7BFE8" }, // 10
            { top: "#00c6ff", bottom: "#0072ff" }, // 11
            { top: "#7F00FF", bottom: "#E100FF" }, // 12
            { top: "#ad5389", bottom: "#3c1053" }, // 13
            { top: "#a8c0ff", bottom: "#3f2b96" }, // 14
            { top: "#36D1DC", bottom: "#5B86E5" }, // 15
            { top: "#20002c", bottom: "#cbb4d4" }, // 16
            { top: "#44A08D", bottom: "#093637" }, // 17
            { top: "#4568DC", bottom: "#B06AB3" }, // 18
            { top: "#E8CBC0", bottom: "#636FA4" }, // 19
            { top: "#DCE35B", bottom: "#45B649" }, // 20
        ]
        let index = colorArr[Phaser.Math.between(0, colorArr.length - 1)]
        this.color1 = index.top
        this.color2 = index.bottom
        bgColor.addColorStop(0, this.color1)
        bgColor.addColorStop(1, this.color2)
    }
}
function updateScore() {
    scoreText.text = "Score: " + score + "\nBest: " + topScore
}
function prepareToJump() {
    if (ninja.body.velocity.y == 0) {
        powerBar = game.add.sprite(ninja.x, ninja.y - 50, "powerbar")
        powerBar.width = 0
        powerTween = game.add.tween(powerBar).to({ width: 100 }, 1000, "Linear", true)
        game.input.onDown.remove(prepareToJump, this)
        game.input.onUp.add(jump, this)
    }
}
function jump() {
    ninjaJumpPower = -powerBar.width * 3 - 100
    powerBar.destroy()
    ninja.body.velocity.y = ninjaJumpPower * 2
    ninjaJumping = true
    game.input.onUp.remove(jump, this)
}
function addNewPoles() {
    let maxPoleX = 0
    poleGroup.forEach(function (item) {
        maxPoleX = Math.max(item.x, maxPoleX)
    })
    let nextPolePosition = maxPoleX + Phaser.Math.between(poleGap.min, poleGap.max)
    addPole(nextPolePosition)
}
function addPole(poleX) {
    if (poleX < game.width * 2) {
        placedPoles++

        let pole = poleGroup.getFirstExists(false)
        if (!pole) {
            pole = poleGroup.create(poleX, Phaser.Math.between(600, 750), 'pole')
        }

        pole.anchor.set(0.5, 0)
        pole.scale.set(2, 1)
        pole.poleNumber = placedPoles
        pole.body.immovable = true
        pole.body.allowGravity = false

        let nextPolePosition = poleX + Phaser.Math.between(poleGap.min, poleGap.max)
        addPole(nextPolePosition)
    }
}
function gameOver() {
    localStorage.setItem("jumper", Math.max(score, topScore))

    gameover.alpha = 0.7
    gameover.inputEnabled = true
    gameover.events.onInputDown.add(restartGame)

    let gameoverText = game.add.bitmapText(game.width / 2, game.height / 3, "font", "GAME OVER", 60)
    gameoverText.anchor.setTo(0.5, 0.5)

    let restartText = game.add.bitmapText(game.width / 2, game.height / 2, "font", "TAP TO RESTART", 40)
    restartText.anchor.setTo(0.5, 0.5)

    game.world.bringToTop(gameover)
    game.world.bringToTop(gameoverText)
    game.world.bringToTop(restartText)
}
function restartGame() {
    game.state.start("GameState")
}
function checkLanding(_ninja, _pole) {
    _pole.alpha = 0.5
    _pole.y += 0.2

    poleGroup.children.forEach(element => {
        if(element.poleNumber < _pole.poleNumber){
            element.destroy()
        }
    });

    if(_ninja.body.touching.down){ 
        let poleDiff = _pole.poleNumber - _ninja.lastPole
        if (poleDiff > 0) {
            score += 2 * poleDiff
            updateScore()
            _ninja.lastPole = _pole.poleNumber
        }
        if (ninjaJumping) {
            ninjaJumping = false
            game.input.onDown.add(prepareToJump, this)
        }
    }
    else {
        ninjaFallingDown = true
        poleGroup.forEach(function (item) {
            item.body.velocity.x = 0
        })
    }
}

let game = new Phaser.Game(800, 1080, Phaser.CANVAS)
game.state.add('GameState', GameState)
game.state.start('GameState')