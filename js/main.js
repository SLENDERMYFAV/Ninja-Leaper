let mountainBack
let mountainMid
let mountainFront
let placedPoles
let poleGroup
let poleGap = {
    min: 100,
    max: 200
}
let ninja
let ninjaFallingDown
let ninjaJumpPower
let powerBar
let powerTween
let ninjaJumping
let points= 0
let pointsText
let gameover

setUpCanvas()
gameInitialization()

function setUpCanvas(){
    GameState = {
        init: function() {
            scaleManager()
            this.game.physics.startSystem(Phaser.Physics.ARCADE)
        },
        preload: function () {
            game.load.crossOrigin = 'anonymous';
            loadAssets()
        },
        create: function () {
            placedPoles = 0
            ninjaFallingDown= false
            ninjaJumping=  false
            Create()
            pointsText= game.add.bitmapText(game.width-100, game.height/15, "font", "", 45)
            pointsText.anchor.setTo(0.5, 0.8)
            updateScore()
            poleGroup = this.game.add.group()
            poleGroup.enableBody = true
            game.input.onDown.add(prepareToJump, this)
            addPole(80)
            poleCreator= game.time.events.loop(Phaser.Timer.SECOND*1, addNewPoles, this)

        },
        update: function () {
            game.physics.arcade.collide(ninja, poleGroup, checkLanding)
            if(ninja.y > game.height){
                gameOver()
            }
            Update()
        }
    }
    game = new Phaser.Game(800, 1080, Phaser.CANVAS)
}

function gameInitialization() {
    game.state.add('GameState', GameState)
    game.state.start('GameState')
}

function scaleManager() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.pageAlignHorizontally = true
    game.scale.pageAlignVertically = true
}

function loadAssets() {
    game.load.image("mountains-back", "assets/images/mountains-back.png")
    game.load.image("mountains-mid1", "assets/images/mountains-mid1.png")
    game.load.image("mountains-mid2", "assets/images/mountains-mid2.png")
    //game.load.image("ninja_", "assets/images/ninja_.png")
    game.load.image("gameover", "assets/images/gameover.png")
    game.load.image("ninja", "assets/images/ninja.png")
    game.load.image("pole", "assets/images/pole.png")
    game.load.image("powerbar", "assets/images/powerbar.png")
    game.load.bitmapFont("font", "assets/images/font.png", "assets/font/font.fnt")
}

function generateGradientBackground() {
    game.stage.backgroundColor = '#FFF'
    let myBitmap = game.add.bitmapData(game.width, game.height)
    bgColor = myBitmap.context.createLinearGradient(0, 0, 0, 500)
    addGradientColors()
    myBitmap.context.fillStyle = bgColor
    myBitmap.context.fillRect(0, 0, game.width, game.height)

    let bitmapSprite = game.add.sprite(0, 0, myBitmap)
    bitmapSprite.alpha = 0
    game.add.tween(bitmapSprite).to({ alpha: 1 }, 1000).start()
}

function addGradientColors() {
    let colorArr = [
        { top: '#FF0099', bottom: '#493240' }, //0
        { top: '#7F00FF', bottom: '#E100FF' },//1
        { top: '#d9a7c7', bottom: '#fffcdc' }//2/ 4
    ]
    let index = colorArr[Phaser.Math.between(0, colorArr.length - 1)]
    this.color1 = index.top
    this.color2 = index.bottom
    bgColor.addColorStop(0, this.color1)
    bgColor.addColorStop(1, this.color2)
}

function generateMountains(){
    mountainBack= game.add.tileSprite(0, game.height-game.cache.getImage('mountains-back').height, game.width, game.cache.getImage('mountains-back').height, 'mountains-back')
    mountainMid= game.add.tileSprite(0, game.height-game.cache.getImage('mountains-mid1').height, game.width, game.cache.getImage('mountains-mid1').height, 'mountains-mid1')
    mountainFront= game.add.tileSprite(0, game.height-game.cache.getImage('mountains-mid2').height, game.width, game.cache.getImage('mountains-mid2').height, 'mountains-mid2')

}

function addPole(x){
   if(x < game.width*2){
       placedPoles++
       let pole= poleGroup.getFirstExists(false)
       if(!pole){
           pole= poleGroup.create(x, Phaser.Math.between(600, 700), 'pole')
       }
       pole.anchor.setTo(0.5, 0)
       pole.scale.setTo(2, 1)
       pole.poleNumber= placedPoles
       pole.body.immovable= true
       pole.body.allowGravity= false
       let nextPolePosition= x+Phaser.Math.between(poleGap.min, poleGap.max)
       addPole(nextPolePosition)
    }
   }
  

function addNewPoles(){
    let maxPoleX= 0
    poleGroup.forEach(function (item){
        maxPoleX= Math.max(item.x, maxPoleX)
    })
    let nextPolePosition= maxPoleX+Phaser.Math.between(poleGap.min, poleGap.max)
   addPole(nextPolePosition)
}

function createNinja(){
    ninja= game.add.sprite(80, 0, 'ninja') 
    ninja.anchor.setTo(0.5, 0.5)
    ninja.angle= 0
    game.physics.arcade.enable(ninja)
    ninja.body.gravity.y= 800
    ninja.lastPole= 1
    let ninjaTween= game.add.tween(ninja).to({angle: 360}, 1000, "Linear", true)
    ninjaTween.onComplete.add(function (){
        game.camera.shake(0.015, 200)
    })
}

function checkLanding(_ninja, _pole){
    _pole.alpha= 0.5
    _pole.y+= 2
    poleGroup.children.forEach(element => {
        if(element.poleNumber <= _pole.poleNumber){
            element.destroy
        }
    })
    if(_ninja.body.touching.down){
        let poleDiff= _pole.poleNumber-_ninja.lastPole
        if(poleDiff > 0){
            points+= 2*poleDiff
            updateScore()
            _ninja.lastPole= _pole.poleNumber
        }
        if(ninjaJumping){
            ninjaJumping= false
            game.input.onDown.add(prepareToJump, this)
        }
    }
    else{
        ninjaFallingDown= true
        poleGroup.forEach(function (item){
            item.body.velocity.x= 0
        })
    }
}

function prepareToJump(){
    if(ninja.body.velocity.y == 0){
        powerBar= game.add.sprite(ninja.x, ninja.y-50, 'powerbar')
        powerBar.width= 0
        powerTween= game.add.tween(powerBar).to({width: 100}, 1000, "Linear", true)
        game.input.onDown.remove(prepareToJump, this)
        game.input.onUp.add(jump, this)
    }
}

function jump(){
    ninjaJumpPower= -powerBar.width*3-100
    powerBar.destroy()
    ninja.body.velocity.y= ninjaJumpPower*2
    ninjaJumping= true
    game.input.onUp.remove(jump, this)
}

function leap(){
    if(ninjaJumping&&!ninjaFallingDown){
        poleGroup.setAll('body.velocity.x', ninjaJumpPower)
    }
    else{
        poleGroup.setAll('body.velocity.x', 0)
    }
    if(ninjaJumping){
        mountainBack.tilePosition.x-= 0.05
        mountainMid.tilePosition.x-= 0.3
        mountainFront.tilePosition.x-= 0.75
    }
    else{
        mountainBack.tilePosition.x-= 0.05
        mountainMid.tilePosition.x-= 0.05
        mountainFront.tilePosition.x-= 0.10
    }
}

function gameOver() {
    gameover = game.add.sprite(game.width / 2, game.height / 2, "gameover")
    gameover.anchor.setTo(0.5, 0.5)
    gameover.alpha = 0.15
    gameover.inputEnabled = true
    gameover.events.onInputDown.add(this.restartGame, this)

    let gameoverText = game.add.bitmapText(game.width / 2, game.height / 3, "font", "GAME OVER", 60)
    gameoverText.anchor.setTo(0.5, 0.5)

    let restartText = game.add.bitmapText(game.width / 2, game.height / 2, "font", "TAP TO RESTART", 40)
    restartText.anchor.setTo(0.5, 0.5)

    let scoreText = game.add.bitmapText(game.width / 2, game.height / 1.5, "font", "", 40)
    scoreText.anchor.setTo(0.5, 0.5)
    scoreText.text= 'Score: '+points


    game.world.bringToTop(gameover)
    game.world.bringToTop(gameoverText)
    game.world.bringToTop(restartText)
    game.world.bringToTop(scoreText)
}

function restartGame() {
    game.state.start("GameState")
}

function updateScore(){
    pointsText.text = "Score: "+ points
}