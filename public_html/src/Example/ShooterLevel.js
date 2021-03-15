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

function ShooterLevel() {
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
    this.gOsArray = null;
    this.gOInterceptedArray = null;
}

gEngine.Core.inheritPrototype(ShooterLevel, Scene);

ShooterLevel.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kBg);
    gEngine.Textures.loadTexture(this.kMinionSpriteNormal);
    gEngine.Textures.loadTexture(this.kTurret);
};

ShooterLevel.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kBg);
    gEngine.Textures.unloadTexture(this.kMinionSpriteNormal);
    gEngine.Textures.unloadTexture(this.kTurret);
};

ShooterLevel.prototype.initialize = function () {
    this.drawNodes = false;
    
    this.mCamera = new Camera(
        vec2.fromValues(50, 37.5), // position of the camera
        100,                       // width of camera
        [0, 0, 1280, 720]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    // sets the background to gray
    this.player = new Hero(this.kMinionSprite, this.kMinionSpriteNormal, 10, 40);


    //this.turret = new SpriteRenderable(this.kTurret);
    //this.turret.getXform().setPosition(90, 40);
    //this.turret.getXform().setSize(6, 6);

    this.raycast = new Raycast(this.player.getXform().getPosition(), [this.player.getXform().getXPos() + 200, 40]);

    this.gOsArray = this.makeBVHObjects();
    this.BoundingVolumeManager = new HierarchicalVolumeManager(this.gOsArray);
    this.mHeadNode = this.BoundingVolumeManager.getHeadNode();
    
    window.addEventListener('keydown', function(e) {
        if(e.keyCode == 32 && e.target == document.body) {
            e.preventDefault();
        }
    });
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
ShooterLevel.prototype.draw = function () {
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    this.player.draw(this.mCamera);
    //this.raycastBound.draw(this.mCamera);

    // Gabe: draw BVH
    //this.BoundingVolumeManager.getHeadNode().draw(this.mCamera);
    for (var i = 0; this.drawNodes && i < this.BoundingVolumeManager.getHierarchyArray().length; i++) {
        this.BoundingVolumeManager.getHierarchyArray()[i].draw(this.mCamera);
    }

    //this.wall.draw(this.mCamera);
    // Gabe: draw all walls
    for (var i = 0; i < this.gOsArray.length; i++) {
        if (this.gOsArray[i] !== null) {
            this.gOsArray[i].draw(this.mCamera);
        }
    }

    //this.turret.draw(this.mCamera);
    if (this.gOInterceptedArray !== null) {
        this.raycast.setRayColor([1, 0, 0, 1]);
    } else {
        this.raycast.setRayColor([0, 1, 0, 1]);
    }
    this.raycast.draw(this.mCamera);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
ShooterLevel.prototype.update = function () {
    //this.hideTimeLength++;
    
    this.player.update();
    //this.lookAt(this.player.getXform(), this.turret.getXform());
    //this.turret.update();
    //this.raycastBound.update();
    //this.raycastHitting = this.raycastBound.checkIntersection(this.raycast);
    this.raycast.setStartPoint(this.player.getXform().getPosition());
    this.raycast.setEndPoint([this.player.getXform().getXPos() + 200, this.player.getXform().getYPos()]);
    for (var i = 0; i < this.gOsArray.length; i++) {
        if (this.gOsArray[i] !== null) {
            this.gOsArray[i].setColor([0, 0, 1, 1]);
        }
    }
    this.gOInterceptedArray = this.raycast.update(this.mHeadNode);
    if (this.gOInterceptedArray !== null) {
        for (var i = 0; i < this.gOInterceptedArray.length; i++) {
            this.gOInterceptedArray[i].setColor([1, 0, 0, 1]);
        }
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
        for (var i = 0;this.gOInterceptedArray !== null && i < this.gOInterceptedArray.length; i++) {
            for (var j = 0; j < this.gOsArray.length; j++) {
                if (this.gOInterceptedArray[i] === this.gOsArray[j]) {
                    this.gOInterceptedArray[i] = null;
                    this.gOsArray[j] = null;
                }
            }
        }
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.E)) {
        this.drawNodes = !this.drawNodes;
    }
    this.checkIfAllGOsDestroyed(this.gOsArray);
};

ShooterLevel.prototype.checkIfAllGOsDestroyed = function (gOsArray) {
    var allDestroyed = true;
    if (gOsArray.length !== 0) {
        for (var i = 0; i < gOsArray.length; i++) {
            if (gOsArray[i] !== null) {
                allDestroyed = false;
            }
        }
    }
    if (allDestroyed) {
        this.spawnNewGOs();
    }
};

ShooterLevel.prototype.spawnNewGOs = function () {
    this.gOsArray = this.makeBVHObjects();
    this.BoundingVolumeManager = new HierarchicalVolumeManager(this.gOsArray);
    this.mHeadNode = this.BoundingVolumeManager.getHeadNode();
};

ShooterLevel.prototype.hideForSeconds = function (objsArray) {
    for (var i = 0; i < objsArray.length; i++) {
        
    }
};

ShooterLevel.prototype.makeBVHObjects = function () {
    var objs = [];
    
var randomNum = Math.random() * 20 - 10;
var randSize = Math.random() * 10;
    
    this.wall1 = new Renderable();
    this.wall1.getXform().setPosition(70 + randomNum, 30 + randomNum);
    this.wall1.getXform().setSize(6, 6);
    this.wall1.setColor([0, 0, 1, 1]);
    objs.push(this.wall1);

var randomNum = Math.random() * 20 - 10;

    this.wall2 = new Renderable();
    this.wall2.getXform().setPosition(75 + randomNum, 50 + randomNum);
    this.wall2.getXform().setSize(3.5 + randSize, 3.5 + randSize);
    this.wall2.setColor([0, 0, 1, 1]);
    objs.push(this.wall2);

var randomNum = Math.random() * 20 - 10;

    this.wall3 = new Renderable();
    this.wall3.getXform().setPosition(72 + randomNum, 40 + randomNum);
    this.wall3.getXform().setSize(7.5, 7.5);
    this.wall3.setColor([0, 0, 1, 1]);
    objs.push(this.wall3);

var randomNum = Math.random() * 20 - 10;

    this.wall4 = new Renderable();
    this.wall4.getXform().setPosition(62 + randomNum, 50 + randomNum);
    this.wall4.getXform().setSize(7.5, 5 + randSize);
    this.wall4.setColor([0, 0, 1, 1]);
    objs.push(this.wall4);

var randomNum = Math.random() * 20 - 10;
var randSize = Math.random() * 10;

    this.wall5 = new Renderable();
    this.wall5.getXform().setPosition(62 + randomNum, 20 + randomNum);
    this.wall5.getXform().setSize(9.5 + randSize, 7.5);
    this.wall5.setColor([0, 0, 1, 1]);
    objs.push(this.wall5);

var randomNum = Math.random() * 20 - 10;
var randSize = Math.random() * 10;

    this.wall6 = new Renderable();
    this.wall6.getXform().setPosition(62 + randomNum, 20 + randomNum);
    this.wall6.getXform().setSize(9.5, 7.5 + randSize);
    this.wall6.setColor([0, 0, 1, 1]);
    objs.push(this.wall6);

var randomNum = Math.random() * 20 - 10;
var randSize = Math.random() * 10;

    this.wall7 = new Renderable();
    this.wall7.getXform().setPosition(50 + randomNum, 45 + randomNum);
    this.wall7.getXform().setSize(3.5 + randSize, 4.5 + randSize);
    this.wall7.setColor([0, 0, 1, 1]);
    objs.push(this.wall7);

    return objs;
};