var juego = new Phaser.Game(370, 900, Phaser.CANVAS, 'bloque_juego');
var fondoJuego;
var personaje;
var teclaDerecha;
var teclaIzquierda;
var enemigos;
var balas;
var tiempoBala = 0;
var botonDisparo; 
var sonidoLaser;
var musicaFondo;



var estadoPrincipal = {
    preload: function () {
        juego.load.image('fondo', 'img/img1.png');
        //juego.load.image('fondo2', 'img/escenario.png');
        juego.load.spritesheet('animacion','img/nave_optimizada.png', 38, 56);
        juego.load.spritesheet('enemigo', 'img/enemigo1.png', 48, 48);
        juego.load.image('laser', 'img/laser.png');
        juego.load.audio('musicaFondo', 'sound/fondo.mp3');
        juego.load.audio('sonidoLaser', 'sound/laser.mp3');

    },

    create: function () {
        fondoJuego = juego.add.tileSprite(0, 0, 370, 900, 'fondo');
        musicaFondo = juego.add.audio('musicaFondo');
        musicaFondo.loopFull(0.7); // Reproducir en bucle con 40% de volumen

        personaje = juego.add.sprite(90,650,'animacion');
		personaje.animations.add('movimiento',[0,1,2,3],10,true);
        sonidoLaser = juego.add.audio('sonidoLaser');
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

        // Crear el rectángulo (marco)
		marco = juego.add.graphics(0, 0);
		marco.lineStyle(2, 0xFF0000, 1); // Línea roja de 2 píxeles
		marco.drawRect(0, 0, personaje.width, personaje.height); // Dibujar rectángulo sobre el sprite
    },

    update: function () {
        fondoJuego.tilePosition.x -= 1;

        fondoJuego.tilePosition.x -= 1;

    if(teclaDerecha.isDown){
        personaje.x += 5;
        personaje.animations.play('movimiento');
    } else if(teclaIzquierda.isDown){
        personaje.x -= 5;
        personaje.animations.play('movimiento');
    } else {
        personaje.animations.stop(); // Detiene la animación
        personaje.frame = 0; // Muestra el primer frame estático
    }

        var bala;
        if (botonDisparo.isDown) {
            if (juego.time.now > tiempoBala) {
                bala = balas.getFirstExists(false);
                sonidoLaser.play('', 0, 0.3);
            }
            if (bala) {
                bala.reset(personaje.x +20 , personaje.y);
               
                bala.body.velocity.y = -3000;  //Velocidad de disparo hacia arriba
                tiempoBala = juego.time.now + 50; //Disparo cada 50 ms = más rápido
            }
        }

        juego.physics.arcade.overlap(balas, enemigos, colision, null, this);

        // Actualizar la posición del marco para que siga al personaje
		marco.x = personaje.x;
		marco.y = personaje.y;
    }
};
function colision (bala,enemigo){
	bala.kill();
	enemigo.kill();
}

juego.state.add('principal', estadoPrincipal);
juego.state.start('principal');