/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Constructor that takes in the center position of the bounding box and the width and the height
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

// Inheritance
gEngine.Core.inheritPrototype(BoundingRaycastBox, BoundingBox);
// Draws the bounding box given a camera
BoundingRaycastBox.prototype.draw = function (aCamera) {
    this.myGameObject.draw(aCamera);
};
// Updates the positions and the corners
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
// Returns the transform object
BoundingRaycastBox.prototype.getXform = function () {
    return this.myGameObject.getXform();
};
// Given a raycast checks if there is an intersection
BoundingRaycastBox.prototype.checkIntersection = function (raycast) {
    return this.getXform().checkIntersection(raycast);
};
// Getters and Setters for the member variables
BoundingRaycastBox.prototype.getCorners = function () {
    return this.corners;
};
BoundingRaycastBox.prototype.getParent = function () {
    return this.parent;
};
BoundingRaycastBox.prototype.setParent = function (node) {
    this.parent = Object.assign(node);
};
BoundingRaycastBox.prototype.getLeftChild = function () {
    return this.leftChild;
};
BoundingRaycastBox.prototype.getRightChild = function () {
    return this.rightChild;
};
BoundingRaycastBox.prototype.setLeftChild = function (node) {
    this.leftChild = node;
};
BoundingRaycastBox.prototype.setRightChild = function (node) {
    this.rightChild = node;
};
// Returns the game objects inside the bounding box
BoundingRaycastBox.prototype.getGameObjectsArray = function () {
    return this.myGameObjectsArray;
};
// Clears the game objects inside the bounding box
BoundingRaycastBox.prototype.clearGameObjectsArray = function () {
    this.myGameObjectsArray = [];
};
BoundingRaycastBox.prototype.hasChildren = function () {
    return this.getLeftChild() !== null;
};
// Sets the game objects inside the bounding box
BoundingRaycastBox.prototype.setGameObjectsArray = function (gameObjectsArray) {
    this.myGameObjectsArray = Object.assign(gameObjectsArray);
};