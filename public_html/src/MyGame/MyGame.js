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

function MyGame() {
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kMinionSpriteNormal = "assets/minion_sprite_normal.png";
    this.kBg = "assets/bg.png";
    this.kBgNormal = "assets/bg_normal.png";
    this.kBgLayer = "assets/bgLayer.png";
    this.kBgLayerNormal = "assets/bgLayer_normal.png";
    
    this.raycastHitting = false;

    // The camera to view the scene
    this.mCamera = null;
    this.mParallaxCam = null;
    this.mShowHeroCam = false;

    this.mBg = null;
    this.mBgL1 = null;
    this.mFront = null;

    this.mMsg = null;
    this.mMatMsg = null;

    // the hero and the support objects
    this.mLgtHero = null;
    this.mIllumHero = null;
    this.rayCastEnd = null;

    this.mLgtMinion = null;
    this.mIllumMinion = null;

    this.mGlobalLightSet = null;

    this.mBlock1 = null;   // to verify swiitching between shaders is fine
    this.mBlock2 = null;

    this.mLgtIndex = 0;
    this.mLgtRotateTheta = 0;

    // shadow support
    this.mBgShadow1 = null;

    // Gabe: testing VolumeNode object
    this.testBoundingRaycastBox2 = null;
    this.testBoundingRaycastBox = null;

    // Gabe: testing Raycasts object
    this.testRaycast = null;

    // Gabe: testing GO storage for detecting raycast interception
    this.testGOArray = [];
    this.worldOrigin = null;
    
    // Gabe: node manager
    this.BoundingVolumeManager = null;
}

gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kBg);
    gEngine.Textures.loadTexture(this.kBgNormal);
    gEngine.Textures.loadTexture(this.kBgLayer);
    gEngine.Textures.loadTexture(this.kBgLayerNormal);
    gEngine.Textures.loadTexture(this.kMinionSpriteNormal);
};

MyGame.prototype.unloadScene = function () {
    gEngine.LayerManager.cleanUp();

    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kBg);
    gEngine.Textures.unloadTexture(this.kBgNormal);
    gEngine.Textures.unloadTexture(this.kBgLayer);
    gEngine.Textures.unloadTexture(this.kBgLayerNormal);
    gEngine.Textures.unloadTexture(this.kMinionSpriteNormal);
};

MyGame.prototype.initialize = function () {


    // Step A: set up the cameras
//    this.mParallaxCam = new Camera(
//        vec2.fromValues(25, 40), // position of the camera
//        30,                       // width of camera
//        [0, 420, 700, 300],           // viewport (orgX, orgY, width, height)
//        2
//    );
//    this.mParallaxCam.setBackgroundColor([0.5, 0.5, 0.9, 1]);

    this.mCamera = new Camera(
        vec2.fromValues(50, 37.5), // position of the camera
        100,                       // width of camera
        [0, 0, 1280, 720]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    // sets the background to gray

    // Step B: the lights
    this._initializeLights();   // defined in MyGame_Lights.js

    // Step C: the far Background
    var bgR = new IllumRenderable(this.kBg, this.kBgNormal);
    bgR.setElementPixelPositions(0, 1024, 0, 1024);
    bgR.getXform().setSize(30, 30);
    bgR.getXform().setPosition(0, 0);
    bgR.getMaterial().setSpecular([0.2, 0.1, 0.1, 1]);
    bgR.getMaterial().setShininess(50);
    bgR.getXform().setZPos(-10);
    bgR.addLight(this.mGlobalLightSet.getLightAt(1));   // only the directional light
    this.mBg = new ParallaxGameObject(bgR, 5, this.mCamera);
    this.mBg.setCurrentFrontDir([0, -1, 0]);
    this.mBg.setSpeed(0.1);

    // Step D: the closer Background
    var i;
    var bgR1 = new IllumRenderable(this.kBgLayer, this.kBgLayerNormal);
    bgR1.getXform().setSize(25, 25);
    bgR1.getXform().setPosition(0, 0);
    bgR1.getXform().setZPos(0);
    bgR1.addLight(this.mGlobalLightSet.getLightAt(1));   // the directional light
    bgR1.addLight(this.mGlobalLightSet.getLightAt(2));   // the hero spotlight light
    bgR1.addLight(this.mGlobalLightSet.getLightAt(3));   // the hero spotlight light
    bgR1.getMaterial().setSpecular([0.2, 0.2, 0.5, 1]);
    bgR1.getMaterial().setShininess(10);
    this.mBgL1 = new ParallaxGameObject(bgR1, 3, this.mCamera);
    this.mBgL1.setCurrentFrontDir([0, -1, 0]);
    this.mBgL1.setSpeed(0.1);

    // Step E: the front layer 
    var f = new TextureRenderable(this.kBgLayer);
    f.getXform().setSize(30, 30);
    f.getXform().setPosition(0, 0);
    this.mFront = new ParallaxGameObject(f, 0.9, this.mCamera);

    // 
    // the objects
    this.mIllumHero = new Hero(this.kMinionSprite, this.kMinionSpriteNormal, 40, 30);
    this.rayCastEnd = new SpriteRenderable(this.kMinionSprite);
    this.rayCastEnd.setColor([1, 1, 1, 0]);
    this.rayCastEnd.getXform().setSize(5, 5);
    this.rayCastEnd.getXform().setPosition(40, 30);
    this.mLgtHero = new Hero(this.kMinionSprite, null, 60, 40);
    this.mIllumMinion = new Minion(this.kMinionSprite, this.kMinionSpriteNormal, 25, 40);
    this.mLgtMinion = new Minion(this.kMinionSprite, null, 65, 25);
    for (i = 0; i < 4; i++) {
        this.mIllumHero.getRenderable().addLight(this.mGlobalLightSet.getLightAt(i));
        this.mLgtHero.getRenderable().addLight(this.mGlobalLightSet.getLightAt(i));
        this.mIllumMinion.getRenderable().addLight(this.mGlobalLightSet.getLightAt(i));
        this.mLgtMinion.getRenderable().addLight(this.mGlobalLightSet.getLightAt(i));
    }

    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([1, 1, 1, 1]);
    this.mMsg.getXform().setPosition(6, 15);
    this.mMsg.setTextHeight(3);

    this.mMatMsg = new FontRenderable("Status Message");
    this.mMatMsg.setColor([1, 1, 1, 1]);
    this.mMatMsg.getXform().setPosition(6, 65);
    this.mMatMsg.setTextHeight(3);

    this.mBlock1 = new Renderable();
    this.mBlock1.setColor([1, 0, 0, 1]);
    this.mBlock1.getXform().setSize(5, 5);
    this.mBlock1.getXform().setPosition(30, 50);

    this.mBlock2 = new Renderable();
    this.mBlock2.setColor([0, 1, 0, 1]);
    this.mBlock2.getXform().setSize(5, 5);
    this.mBlock2.getXform().setPosition(70, 50);

    this.mSlectedCh = this.mIllumHero;
    this.mMaterialCh = this.mSlectedCh.getRenderable().getMaterial().getDiffuse();
    this.mSelectedChMsg = "H:";

    this._setupShadow();  // defined in MyGame_Shadow.js


    // Gabe: testing VolumeNode object
    this.testBoundingRaycastBox = new BoundingRaycastBox([30, 40], 3, 3);
    this.testBoundingRaycastBox2 = new BoundingRaycastBox([30, 47], 3, 3);
    // Gabe: testing Raycast object
    this.testRaycast = new Raycast([40, 30], [50, 37.5]);
    this.testGOArray = [this.testBoundingRaycastBox, this.testBoundingRaycastBox2];
    this.worldOrigin = new Renderable();
    this.worldOrigin.setColor([1, 0, 0, 1]);
    this.worldOrigin.getXform().setSize(2, 2);
    this.worldOrigin.getXform().setPosition(0, 0);
    // Gabe: bounding volume manager initialization
    //new manager(array of all GOs)
    // when creating the manager, must have an array of all gameobjects ready to pass in

    // add to layer managers ...
    // 
    // Gabe: commented out adding GOs to layers for a clear canvas
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eBackground, this.mBg);
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eShadowReceiver, this.mBgShadow1);
//    
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mIllumMinion);
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mLgtMinion);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mIllumHero);
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mLgtHero);
//    
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eFront, this.mBlock1);
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eFront, this.mBlock2);
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eFront, this.mFront);
//    
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mMsg);
//    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mMatMsg);

    // Gabe: testing VolumeNode object being added to layer to be drawn
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.testBoundingRaycastBox);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.testBoundingRaycastBox2);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.testRaycast);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.worldOrigin);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.rayCastEnd);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    gEngine.LayerManager.drawAllLayers(this.mCamera);
    
    if (this.raycastHitting) {
        this.testRaycast.setRayColor([1, 1, 1, 1]);
    } else {
        this.testRaycast.setRayColor([0,0,0,1]);
    }

//    if (this.mShowHeroCam) {
//        this.mParallaxCam.setupViewProjection();
//        gEngine.LayerManager.drawAllLayers(this.mParallaxCam);
//    }
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    this.mCamera.update();  // to ensure proper interpolated movement effects
    //this.mParallaxCam.update();

    gEngine.LayerManager.updateAllLayers();

    var xf = this.mLgtHero.getXform();
    this.mCamera.panWith(xf, 0.2);
    this.mGlobalLightSet.getLightAt(3).set2DPosition(xf.getPosition());

    xf = this.mIllumHero.getXform();
    this.mGlobalLightSet.getLightAt(2).set2DPosition(xf.getPosition());

    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P)) {
        this.mShowHeroCam = !this.mShowHeroCam;
    }
    var pos = this.rayCastEnd.getXform().getPosition();
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        pos[1] += 0.5;
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        pos[1] -= 0.5;
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)) {
        pos[0] += 0.5;
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
        pos[0] -= 0.5;
    }
    this.rayCastEnd.getXform().setPosition(pos[0], pos[1]);

    // control the selected light
    var msg = "L=" + this.mLgtIndex + " ";
    msg += this._lightControl();
    this.mMsg.setText(msg);

    msg = this._selectCharacter();
    msg += this.materialControl();
    this.mMatMsg.setText(msg);
    // Gabe: debugging
    //console.log("raycast: " + this.testRaycast.getStartPoint() + ", " + this.testRaycast.getEndPoint());
    this.testRaycast.update();
    this.raycastHitting = this.testBoundingRaycastBox.checkIntersection(this.testRaycast);
    //console.log(this.raycastHitting);
    //console.log("testbox 2:" + this.testBoundingRaycastBox2.checkIntersection(this.testRaycast));
    this.testRaycast.setStartPoint(this.mIllumHero.getXform().getPosition());
    this.testRaycast.setEndPoint((this.rayCastEnd.getXform().getPosition()));
};

MyGame.prototype._selectCharacter = function () {
    // select which character to work with
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Five)) {
        this.mSlectedCh = this.mIllumMinion;
        this.mMaterialCh = this.mSlectedCh.getRenderable().getMaterial().getDiffuse();
        this.mSelectedChMsg = "L:";
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Six)) {
        this.mSlectedCh = this.mIllumHero;
        this.mMaterialCh = this.mSlectedCh.getRenderable().getMaterial().getDiffuse();
        this.mSelectedChMsg = "H:";
    }
    return this.mSelectedChMsg;
};
