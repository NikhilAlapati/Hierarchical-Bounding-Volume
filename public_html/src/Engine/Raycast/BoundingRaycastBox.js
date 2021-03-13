/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function BoundingRaycastBox(centerPos, w, h) {
    this.kSpriteSheetTexture = "assets/minion_sprite.png";
    this.boundRend = new Renderable(this.kSpriteSheetTexture);
    let xform = this.boundRend.getXform();
    this.myXform = xform;
    xform.setSize(w, h);
    xform.setPosition(centerPos[0], centerPos[1]);
    this.boundRend.setColor([1, 1, 1, 0.3]);
    let position = xform.getPosition();
    let size = xform.getSize();
    let halfWidth = size[0] / 2;
    let halfHeight = size[1] / 2;
    this.corners = [
        [position[0] - halfWidth, position[1] + halfHeight],// T left
        [(position[0] + halfWidth), position[1] + halfHeight],// T right
        [position[0] - halfWidth, position[1] - halfHeight],// B left
        [position[0] + halfWidth, position[1] - halfHeight]];// B right
    //this.boundRend.setElementUVCoordinate(0.15, 0.3, 0, 0.4);
    this.myGameObject = new GameObject(this.boundRend);

    this.myBoundingBox = new BoundingBox(centerPos, w, h);

    // node properties
    this.parent = null;
    this.leftChild = null;
    this.rightChild = null;
    this.myGameObjectsArray = [];
}

gEngine.Core.inheritPrototype(BoundingRaycastBox, BoundingBox);

BoundingRaycastBox.prototype.draw = function (aCamera) {
    this.myGameObject.draw(aCamera);
};

BoundingRaycastBox.prototype.update = function () {
    this.myGameObject.update();
    let xform = this.myGameObject.getXform();
    let position = xform.getPosition();
    let size = xform.getSize();
    let halfWidth = size[0] / 2;
    let halfHeight = size[1] / 2;
    
    this.corners = [
        [position[0] - halfWidth, position[1] + halfHeight],// T left
        [(position[0] + halfWidth), position[1] + halfHeight],// T right
        [position[0] - halfWidth, position[1] - halfHeight],// B left
        [position[0] + halfWidth, position[1] - halfHeight]];// B right
};

BoundingRaycastBox.prototype.getXform = function () {
    return this.myGameObject.getXform();
};

BoundingRaycastBox.prototype.checkIntersection = function (raycast) {
    return this.getXform().checkIntersection(raycast);
}; 

BoundingRaycastBox.prototype.getCorners = function () { return this.corners; };
BoundingRaycastBox.prototype.getParent = function () { return this.parent; };
BoundingRaycastBox.prototype.setParent = function (node) { this.parent = Object.assign(node); };
BoundingRaycastBox.prototype.getLeftChild = function () { return this.leftChild; };
BoundingRaycastBox.prototype.getRightChild = function () { return this.rightChild; };
BoundingRaycastBox.prototype.setLeftChild = function (node) { this.leftChild = node; };
BoundingRaycastBox.prototype.setRightChild = function (node) { this.rightChild = node; };
BoundingRaycastBox.prototype.getGameObjectsArray = function () { return this.myGameObjectsArray; };
BoundingRaycastBox.prototype.clearGameObjectsArray = function () { this.myGameObjectsArray = []; };
BoundingRaycastBox.prototype.hasChildren = function () { return this.getLeftChild() !== null; };

BoundingRaycastBox.prototype.setGameObjectsArray = function (gameObjectsArray) { 
    console.log("myGOs array: " + gameObjectsArray);
    this.myGameObjectsArray = Object.assign(gameObjectsArray);
};