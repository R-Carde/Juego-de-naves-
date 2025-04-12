var juego = new Phaser.Game(370, 900, Phaser.CANVAS, 'bloque_juego');
var fondoJuego;
var personaje;
var teclaDerecha;
var teclaIzquierda;
var enemigos;
var balas;
var tiempoBala = 0;
var botonDisparo;

var estadoPrincipal = {
    preload: function () {
        juego.load.image('fondo', 'img/img1.png');
        //juego.load.image('fondo2', 'img/escenario.png');
        juego.load.spritesheet('animacion','img/spritesheet1.png',256,256);
        juego.load.spritesheet('enemigo', 'img/enemigo1.png', 48, 48);
        juego.load.image('laser', 'img/laser.png');
    },

    create: function () {
        fondoJuego = juego.add.tileSprite(0, 0, 370, 900, 'fondo');
        personaje = juego.add.sprite(90,650,'animacion');
		personaje.animations.add('movimiento',[0,1,2,3,4],10,true);

        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;

        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                var enemig = enemigos.create(x * 50, y * 50, 'enemigo');
                enemig.anchor.setTo(0.5);
            }
        }

        enemigos.x = 100;
        enemigos.y = 390;

        var animacion = juego.add.tween(enemigos).to(
            { x: 200 },
            1000,
            Phaser.Easing.Linear.None,
            true,
            0,
            1000,
            true
        );

        teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Crear grupo de balas
        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20, 'laser');
        balas.setAll('anchor.x', 0.5);
        balas.setAll('anchor.y', 1);
        balas.setAll('outOfBoundsKill', true);
        balas.setAll('checkWorldBounds', true);
    },

    update: function () {
        fondoJuego.tilePosition.x -= 1;

        if (teclaDerecha.isDown) {
            personaje.x++;
            personaje.animations.play('movimiento');
        } else if (teclaIzquierda.isDown) {
            personaje.x--;
            personaje.animations.play('movimiento');
        }

        var bala;
        if (botonDisparo.isDown) {
            if (juego.time.now > tiempoBala) {
                bala = balas.getFirstExists(false);
            }
            if (bala) {
                bala.reset(personaje.x + 130, personaje.y);
               
                bala.body.velocity.y = -300;
                tiempoBala = juego.time.now + 100;
            }
        }

        juego.physics.arcade.overlap(balas, enemigos, colision, null, this);
    }
};
function colision (bala,enemigo){
	bala.kill();
	enemigo.kill();
}

juego.state.add('principal', estadoPrincipal);
juego.state.start('principal');