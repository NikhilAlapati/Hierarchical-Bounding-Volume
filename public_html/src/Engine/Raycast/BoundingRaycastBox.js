/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function BoundingRaycastBox(centerPos, w, h) {
    this.kSpriteSheetTexture = "assets/minion_sprite.png";
    this.boundRend = new Renderable(this.kSpriteSheetTexture);
    let xform = this.boundRend.getXform();
    xform.setSize(7.5, 7.5);
    xform.setPosition(centerPos[0], centerPos[1]);
    this.boundRend.setColor([1, 1, 1, 1]);
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
};

BoundingRaycastBox.prototype.getXform = function () {
    return this.myGameObject.getXform();
};

BoundingRaycastBox.prototype.checkIntersection = function (raycast) {
    let line = raycast.getLine();
    let cornerTracker = [];

    for (let i = 0; i < this.corners.length; i++) {
        if (line[0] * this.corners[i][0] + line[1] > this.corners[i][1]) {
            cornerTracker.push(0);
        } else if (line[0] * this.corners[i][0] + line[1] < this.corners[i][1]) {
            cornerTracker.push(1);
        } else {
            return false;
        }
    }
    for (let i = 0; i < cornerTracker.length - 1; i++) {
        if (cornerTracker[i] !== cornerTracker[i + 1]) {
            return true;
        }
    }
    return false;
}; 

BoundingRaycastBox.prototype.getCorners = function () {
    return this.corners;
};