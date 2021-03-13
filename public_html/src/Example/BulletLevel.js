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

function BulletLevel() {
    this.kTurret = "assets/turret.png";
    
    this.mCamera = null;
    
    this.turret = null;
    this.targets = [];
    this.spawnRate = 2;
    
    // Gabe: Raycast & BVH
    this.mBVH = null;
    this.raycast = null;
}

gEngine.Core.inheritPrototype(BulletLevel, Scene);

BulletLevel.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kTurret);
};

BulletLevel.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kTurret);
};

BulletLevel.prototype.initialize = function () {

    this.mCamera = new Camera(
        vec2.fromValues(50, 37.5), // position of the camera
        100,                       // width of camera
        [0, 0, 1280, 720]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    // sets the background to gray
    
    this.turret = new SpriteRenderable(this.kTurret);
    this.turret.getXform().setPosition(10, 20);
    this.turret.getXform().setSize(6, 6);
    
    this.raycast = new Raycast(this.turret.getXform().getPosition(), 
        [this.mCamera.mouseWCX(), this.mCamera.mouseWCY()]);
    this.targets.push(new BoundingRaycastBox([50, 30], 7.5, 7.5));
    this.spawnRandomBox();
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
BulletLevel.prototype.draw = function () {
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    this.turret.draw(this.mCamera);
    for (var i = 0; i < this.targets.length; i++) {
        this.targets[i].draw(this.mCamera);
    }
    
    //if () {
        this.raycast.setRayColor([1, 0, 0, 1]);
    //} else {
        this.raycast.setRayColor([0, 1, 0, 1]);
    //}
    this.raycast.draw(this.mCamera);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
BulletLevel.prototype.update = function () {
    var posX = this.mCamera.mouseWCX();
    var posY = this.mCamera.mouseWCY();
    var mousePos = [posX, posY];
    this.lookAt(mousePos, this.turret.getXform());
    this.turret.update();
    this.raycast.setEndPoint(mousePos);
    if (gEngine.Input.isButtonClicked(0)) {
        for (var i = this.targets.length - 1; i >= 0; i--) {
            if (this.targets[i].checkIntersection(this.raycast)) {
                this.targets.splice(i, 1);
            }
        }
    }
    this.raycast.update();
};

BulletLevel.prototype.lookAt = function(mousePos, looker) {
    var tarX = mousePos[0];
    var tarY = mousePos[1];
    var lookX = looker.getXPos();
    var lookY = looker.getYPos();
    var nCur = [0, 1];
    var nTarX = (tarX - lookX);
    var nTarY = (tarY - lookY);
    var magnitude = Math.sqrt((nTarX * nTarX) + (nTarY * nTarY));
    var nTar = [nTarX / magnitude, nTarY / magnitude];
    var dot = this.dotProduct(nCur, nTar);
    var angle = Math.acos(dot);
    if (tarX > lookX) {
        angle *= -1;
    }
    looker.setRotationInRad(angle);
};

BulletLevel.prototype.dotProduct = function(vec1, vec2) {
    var dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
    return dot(vec1, vec2);
};

BulletLevel.prototype.spawnRandomBox = function() {
    var randPosX = Math.random() * 50 + 50;
    var randPosY = Math.random() * (50 * 9.0 / 16.0) + 37.5;
    this.targets.push(new BoundingRaycastBox([randPosX, randPosY], 7.5, 7.5));
    setTimeout(this.spawnRandomBox.bind(this), this.spawnRate * 1000);
};
