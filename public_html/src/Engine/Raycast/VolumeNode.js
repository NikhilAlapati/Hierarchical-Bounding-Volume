/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function VolumeNode(renderable) {
    this.mGameObject = new GameObject(renderable);
}

VolumeNode.prototype.draw = function () {
    this.mGameObject.draw();
};

VolumeNode.prototype.update = function () {
    this.mGameObject.update();
};

VolumeNode.prototype.getXform = function () { return this.mGameObject.getXform(); };
VolumeNode.prototype.getBBox = function () { return this.mGameObject.getBBox(); };
VolumeNode.prototype.setVisibility = function (f) { this.mGameObject.setVisibility(f); };
VolumeNode.prototype.isVisible = function () { return this.mGameObject.isVisible(); };

VolumeNode.prototype.setSpeed = function (s) { this.mGameObject.setSpeed(s); };
VolumeNode.prototype.getSpeed = function () { return this.mGameObject.getSpeed(); };
VolumeNode.prototype.incSpeedBy = function (delta) { this.mGameObject.incSpeedBy(delta); };

VolumeNode.prototype.setCurrentFrontDir = function (f) { this.mGameObject.setCurrentFrontDir(f); };
VolumeNode.prototype.getCurrentFrontDir = function () { return this.mGameObject.getCurrentFrontDir(); };

VolumeNode.prototype.getRenderable = function () { return this.mGameObject.getRenderable(); };

VolumeNode.prototype.setPhysicsComponent = function (p) { this.mGameObject.setPhysicsComponent(p); };
VolumeNode.prototype.getPhysicsComponent = function () { return this.mGameObject.getPhysicsComponent(); };

// Orientate the entire object to point towards point p
// will rotate Xform() accordingly
VolumeNode.prototype.rotateObjPointTo = function (p, rate) {
    this.mGameObject.rotateObjPointTo(p, rate);
};