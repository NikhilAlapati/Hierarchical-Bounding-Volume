/*
 * File: MyGame.js
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true, white: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  Renderable, TextureRenderable, FontRenderable, SpriteRenderable, LightRenderable, IllumRenderable,
  GameObject, TiledGameObject, ParallaxGameObject, Hero, Minion, Dye, Light */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function TurretLevel() {
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kMinionSpriteNormal = "assets/minion_sprite_normal.png";
    this.kBg = "assets/bg.png";
    this.kTurret = "assets/turret.png";

    this.mCamera = null;

    this.turret = null;
    this.wall = null;
    this.raycast = null;
    this.player = null;
    this.drawNodes = null;
    this.textDisplay = null;
    this.secondsCountDown = null;
    this.frameCounter = null;
    this.playerLost = null;

    //this.raycastBound = null;
    this.raycastHitting = false;

    // Gabe: node manager and test walls;
    this.BoundingVolumeManager = null;
    this.mHeadNode = null;
    this.wall2 = null;
    this.wall3 = null;
    this.wall4 = null;
    this.wall5 = null;
    this.wall6 = null;
    this.wall7 = null;
    this.wall8 = null;
    this.wall9 = null;
    this.wall10 = null;
    this.gOsArray = null;
    this.gOInterceptedArray = null;
}

gEngine.Core.inheritPrototype(TurretLevel, Scene);

TurretLevel.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kBg);
    gEngine.Textures.loadTexture(this.kMinionSpriteNormal);
    gEngine.Textures.loadTexture(this.kTurret);
};

TurretLevel.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kBg);
    gEngine.Textures.unloadTexture(this.kMinionSpriteNormal);
    gEngine.Textures.unloadTexture(this.kTurret);
};

TurretLevel.prototype.initialize = function () {
    this.playerLost = false;
    this.frameCounter = 0;
    this.secondsCountDown = 6;
    this.textDisplay = new FontRenderable("HIDE: Turret Shoots in " + this.secondsCountDown);
    this.textDisplay.getXform().setPosition(1, 12);
    this.textDisplay.getXform().setSize(20,3);
    
    this.drawNodes = false;
    this.mCamera = new Camera(
        vec2.fromValues(50, 37.5), // position of the camera
        100,                       // width of camera
        [0, 0, 1280, 720]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    // sets the background to gray
    this.player = new Hero(this.kMinionSprite, this.kMinionSpriteNormal, 10, 20);


    this.turret = new SpriteRenderable(this.kTurret);
    this.turret.getXform().setPosition(90, 40);
    this.turret.getXform().setSize(6, 6);

    this.raycast = new Raycast(this.turret.getXform().getPosition(), this.player.getXform().getPosition());

    this.gOsArray = this.makeBVHObjects();
    this.BoundingVolumeManager = new HierarchicalVolumeManager(this.gOsArray);
    this.mHeadNode = this.BoundingVolumeManager.getHeadNode();
    
    window.addEventListener('keydown', function(e) {
        if(e.keyCode === 32 && e.target === document.body) {
            e.preventDefault();
        }
    });
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
TurretLevel.prototype.draw = function () {
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    if (this.player !== null) {
        this.player.draw(this.mCamera);
    }
    //this.raycastBound.draw(this.mCamera);

    // Gabe: draw BVH
    //this.BoundingVolumeManager.getHeadNode().draw(this.mCamera);
    for (var i = 0; this.drawNodes && i < this.BoundingVolumeManager.getHierarchyArray().length; i++) {
        this.BoundingVolumeManager.getHierarchyArray()[i].draw(this.mCamera);
    }

    //this.wall.draw(this.mCamera);
    // Gabe: draw all walls
    for (var i = 0; this.gOsArray[i] !== null && i < this.gOsArray.length; i++) {
        this.gOsArray[i].draw(this.mCamera);
    }

    this.turret.draw(this.mCamera);
    this.raycast.draw(this.mCamera);
    this.textDisplay.draw(this.mCamera);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
TurretLevel.prototype.update = function () {
    this.textDisplay.setText("HIDE: Turret Shoots in " + this.secondsCountDown);
    this.frameCounter++;
    if (this.frameCounter % 60 === 0) {
        this.frameCounter = 0;
        this.secondsCountDown--;
    }
    
    
    if (this.player !== null) {
        this.player.update();
    }
    
    if (this.player !== null) {
        this.lookAt(this.player.getXform(), this.turret.getXform());
    }
    
    this.turret.update();
    //this.raycastBound.update();
    //this.raycastHitting = this.raycastBound.checkIntersection(this.raycast);
    if (this.player !== null) {
        this.raycast.setEndPoint(this.player.getXform().getPosition());
    }
    
    for (var i = 0; this.gOsArray[i] !== null && i < this.gOsArray.length; i++) {
        this.gOsArray[i].setColor([0, 0, 1, 1]);
    }
    this.gOInterceptedArray = this.raycast.update(this.mHeadNode);
    if (this.gOInterceptedArray !== null) {
        this.raycast.setRayColor([1, 0, 0, 1]);
        for (var i = 0; i < this.gOInterceptedArray.length; i++) {
            this.gOInterceptedArray[i].setColor([1, 0, 0, 1]);
        }
    } if (this.gOInterceptedArray !== null && this.gOInterceptedArray.length === 0) { 
        this.raycast.setRayColor([1, 0, 0, 1]); 
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.E)) {
        this.drawNodes = !this.drawNodes;
    }
    
    if (!this.playerLost) {
        if (this.secondsCountDown < 0) {
            this.secondsCountDown = 6;
            if (this.gOInterceptedArray === null || this.gOInterceptedArray.length === 0) {
                this.playerLost = true;
            }
        }
    } else {
        this.player = null;
        this.textDisplay.setText("You Lost: You Were Hit by Turret");
    }
};

TurretLevel.prototype.lookAt = function (target, looker) {
    var tarX = target.getXPos();
    var tarY = target.getYPos();
    var lookX = looker.getXPos();
    var lookY = looker.getYPos();
    var nCur = [0, 1];
    var nTarX = (tarX - lookX);
    var nTarY = (tarY - lookY);
    var magnitude = Math.sqrt((nTarX * nTarX) + (nTarY * nTarY));
    var nTar = [nTarX / magnitude, nTarY / magnitude];
    var dot = this.dotProduct(nCur, nTar);
    var angle = Math.acos(dot);
    looker.setRotationInRad(angle);
};

TurretLevel.prototype.dotProduct = function (vec1, vec2) {
    var dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
    return dot(vec1, vec2);
};

TurretLevel.prototype.makeBVHObjects = function () {
    var objs = [];
    this.wall1 = new Renderable();
    this.wall1.getXform().setPosition(10, 30);
    this.wall1.getXform().setSize(6, 6);
    this.wall1.setColor([0, 0, 1, 1]);
    objs.push(this.wall1);

    this.wall2 = new Renderable();
    this.wall2.getXform().setPosition(75, 45);
    this.wall2.getXform().setSize(3.5, 3.5);
    this.wall2.setColor([0, 0, 1, 1]);
    objs.push(this.wall2);

    this.wall3 = new Renderable();
    this.wall3.getXform().setPosition(42, 40);
    this.wall3.getXform().setSize(7.5, 7.5);
    this.wall3.setColor([0, 0, 1, 1]);
    objs.push(this.wall3);

    this.wall4 = new Renderable();
    this.wall4.getXform().setPosition(42, 50);
    this.wall4.getXform().setSize(7.5, 5);
    this.wall4.setColor([0, 0, 1, 1]);
    objs.push(this.wall4);

    this.wall5 = new Renderable();
    this.wall5.getXform().setPosition(42, 20);
    this.wall5.getXform().setSize(9.5, 7.5);
    this.wall5.setColor([0, 0, 1, 1]);
    objs.push(this.wall5);

    this.wall6 = new Renderable();
    this.wall6.getXform().setPosition(52, 20);
    this.wall6.getXform().setSize(9.5, 7.5);
    this.wall6.setColor([0, 0, 1, 1]);
    objs.push(this.wall6);

    this.wall7 = new Renderable();
    this.wall7.getXform().setPosition(62, 20);
    this.wall7.getXform().setSize(9.5, 7.5);
    this.wall7.setColor([0, 0, 1, 1]);
    objs.push(this.wall7);

    this.wall8 = new Renderable();
    this.wall8.getXform().setPosition(72, 23);
    this.wall8.getXform().setSize(9.5, 7.5);
    this.wall8.setColor([0, 0, 1, 1]);
    objs.push(this.wall8);

    this.wall9 = new Renderable();
    this.wall9.getXform().setPosition(82, 20);
    this.wall9.getXform().setSize(9.5, 7.5);
    this.wall9.setColor([0, 0, 1, 1]);
    objs.push(this.wall9);

    this.wall10 = new Renderable();
    this.wall10.getXform().setPosition(42, 60);
    this.wall10.getXform().setSize(5, 7.5);
    this.wall10.setColor([0, 0, 1, 1]);
    objs.push(this.wall10);

    return objs;
};