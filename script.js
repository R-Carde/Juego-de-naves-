// Variables principales
var juego = new Phaser.Game(370, 900, Phaser.CANVAS, 'bloque_juego');

var fondoJuego, personaje, teclaDerecha, teclaIzquierda, botonDisparo;
var balas, tiempoBala = 0;
var sonidoLaser, musicaFondo;
var gruposEnemigos = [];
var jefe = null, jefeVida = 10;
var barraVidaJefe = null;
var jefeActivo = false;
var puntos = 0;
var textoPuntos;

var estadoPrincipal = {
    preload: function () {
        juego.load.image('fondo', 'img/img1.png');
        juego.load.spritesheet('animacion', 'img/nave_optimizada.png', 38, 56);
        juego.load.spritesheet('enemigo', 'img/enemigo1.png', 48, 48);
        juego.load.image('enemigo2', 'img/enemigo2.png', 48, 48);
        juego.load.image('laser', 'img/laser.png');
        juego.load.image('jefe', 'img/jefe.png');
        juego.load.audio('musicaFondo', 'sound/fondo.mp3');
        juego.load.audio('sonidoLaser', 'sound/laser.mp3');
    },

    create: function () {
        musicaFondo = juego.add.audio('musicaFondo');
        //musicaFondo.loopFull(0.7);

        fondoJuego = juego.add.tileSprite(0, 0, 370, 900, 'fondo');

        personaje = juego.add.sprite(90, 650, 'animacion');
        personaje.animations.add('movimiento', [0, 1, 2, 3], 10, true);

        sonidoLaser = juego.add.audio('sonidoLaser');

        this.enemigos = this.crearGrupoEnemigos();
        this.enemigos2 = this.crearGrupoEnemigos();
        gruposEnemigos.push(this.enemigos);
        gruposEnemigos.push(this.enemigos2);

        juego.time.events.loop(Phaser.Timer.SECOND * 2, this.generarGrupoEnemigos1, this);
        juego.time.events.loop(Phaser.Timer.SECOND * 3, this.generarEnemigo2, this);

        teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20, 'laser');
        balas.setAll('anchor.x', 0.5);
        balas.setAll('anchor.y', 1);
        balas.setAll('outOfBoundsKill', true);
        balas.setAll('checkWorldBounds', true);

        textoPuntos = juego.add.text(10, 10, "Puntos: 0", { font: "20px Arial", fill: "#FFFFFF" });
    },

    update: function () {
        fondoJuego.tilePosition.x -= 1;

        if (teclaDerecha.isDown) {
            personaje.x += 5;
            personaje.animations.play('movimiento');
        } else if (teclaIzquierda.isDown) {
            personaje.x -= 5;
            personaje.animations.play('movimiento');
        } else {
            personaje.animations.stop();
            personaje.frame = 0;
        }

        personaje.x = Phaser.Math.clamp(personaje.x, 0, juego.width - personaje.width);

        // Movimiento y colisiones
        if (!jefeActivo) {
            gruposEnemigos.forEach(grupo => {
                grupo.forEachAlive(enemigo => {
                    enemigo.y += enemigo.velocidad || 1;
                    if (enemigo.y > juego.height) enemigo.kill();
                });
                juego.physics.arcade.overlap(balas, grupo, this.colisionEnemigo, null, this);
            });
        } else if (jefe && jefe.alive) {
            juego.physics.arcade.overlap(balas, jefe, this.colisionJefe, null, this);
        }

        // Disparo
        if (botonDisparo.isDown && juego.time.now > tiempoBala) {
            var bala = balas.getFirstExists(false);
            if (bala) {
                bala.reset(personaje.x + 20, personaje.y);
                bala.body.velocity.y = -500;
                sonidoLaser.play('', 0, 0.3);
                tiempoBala = juego.time.now + 300;
            }
        }

        // Mostrar jefe
        if (puntos >= 1000 && !jefeActivo) {
            jefeActivo = true;
            this.prepararAparicionJefe();
        }

        this.actualizarBarraVida();
    },

    crearGrupoEnemigos: function () {
        var grupo = juego.add.group();
        grupo.enableBody = true;
        grupo.physicsBodyType = Phaser.Physics.ARCADE;
        return grupo;
    },

    crearEnemigo: function (grupo, sprite, x, y, zigzag = false, velocidad = 1) {
        var enemigo = grupo.create(x, y, sprite);
        enemigo.anchor.setTo(0.5);
        enemigo.velocidad = velocidad;

        if (zigzag) {
            var desplazamiento = juego.rnd.integerInRange(20, 40);
            juego.add.tween(enemigo).to(
                { x: enemigo.x + desplazamiento },
                1000, Phaser.Easing.Linear.None, true, 0, -1, true
            );
        }

        return enemigo;
    },

    generarGrupoEnemigos1: function () {
        if (this.enemigos.countLiving() >= 20 || jefeActivo) return;

        var centroX = juego.rnd.integerInRange(100, 270);
        var baseY = -100;
        var espacio = 40;

        var posiciones = [
            [0, 0], [-1, 1], [1, 1], [-2, 2], [0, 2], [2, 2]
        ];

        posiciones.forEach(offset => {
            var x = centroX + offset[0] * espacio;
            var y = baseY + offset[1] * espacio;
            this.crearEnemigo(this.enemigos, 'enemigo', x, y, true, 1);
        });
    },

    generarEnemigo2: function () {
        if (this.enemigos2.countLiving() >= 10 || jefeActivo) return;

        var x = juego.rnd.integerInRange(30, 340);
        var enemigo = this.enemigos2.create(x, 0, 'enemigo2');
        enemigo.anchor.setTo(0.5);
        enemigo.scale.setTo(0.5);
        enemigo.velocidad = 2.5;
    },

    colisionEnemigo: function (bala, enemigo) {
        bala.kill();
        enemigo.kill();
        puntos += 10;
        textoPuntos.text = "Puntos: " + puntos;
    },

    colisionJefe: function (bala, jefeSprite) {
        bala.kill();
    
        if (!jefeSprite.danioRecibido) {
            jefeSprite.danioRecibido = true;
            jefeVida--;
    
            if (barraVidaJefe) {
                this.actualizarBarraVida();
            }
    
            // Efecto de impacto
            jefe.alpha = 0.4;
    
            if (jefeVida <= 0) {
                // Desactivar daño extra mientras muere
                jefe.danioRecibido = true;
    
                // Animación de muerte
                var morir = juego.add.tween(jefe).to(
                    { alpha: 0, y: jefe.y - 30, angle: 360 },
                    1000, Phaser.Easing.Linear.None, true
                );
    
                morir.onComplete.add(() => {
                    jefe.destroy();
                    if (barraVidaJefe) barraVidaJefe.destroy();
                    textoPuntos.text += ' - ¡Jefe derrotado!';
                    barraVidaJefe = null;
                });
    
            } else {
                juego.time.events.add(Phaser.Timer.SECOND * 0.3, () => {
                    jefeSprite.alpha = 1;
                    jefeSprite.danioRecibido = false;
                });
            }
        }
    },
    

    prepararAparicionJefe: function () {
        gruposEnemigos.forEach(grupo => grupo.removeAll(true));
        juego.time.events.add(Phaser.Timer.SECOND * 2, this.aparecerJefe, this);
    },

    aparecerJefe: function () {
        jefe = juego.add.sprite(juego.width / 2, 100, 'jefe');
        jefe.anchor.setTo(0.5);
        jefe.scale.setTo(0.8);
        juego.physics.arcade.enable(jefe);
        jefeVida = 10;
        jefe.danioRecibido = false;
    
        barraVidaJefe = juego.add.graphics(0, 0);
        barraVidaJefe.fixedToCamera = false;
        this.actualizarBarraVida();
    },
    

    actualizarBarraVida: function () {
        if (!jefe || !jefe.alive || !barraVidaJefe) return;

        barraVidaJefe.clear();
        barraVidaJefe.beginFill(0xFF0000);
        barraVidaJefe.drawRect(jefe.x - 25, jefe.y - 40, jefeVida * 10, 8);
        barraVidaJefe.endFill();
    }
};

juego.state.add('principal', estadoPrincipal);
juego.state.start('principal');
