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
    let line = raycast.getLine();
    let cornerTracker = [];

    let rayEndPoint = raycast.getEndPoint();
    let rayStartPoint = raycast.getStartPoint();
    let myXPos = this.myXform.getPosition()[0];
    let myYPos = this.myXform.getPosition()[1];
    //console.log(rayEndPoint[0]);
    if ((rayEndPoint[0] >= (myXPos - this.halfWidth)
        && rayEndPoint[0] <= (myXPos + this.halfWidth))
        && (rayEndPoint[1] >= (myYPos - this.halfHeight)
        && rayEndPoint[1] <= (myYPos + this.halfWidth))) {
        return true;
    }

    // Gabe: This isnt working for some reason???????????????????????????????????????????????????????????
    let startIsLeft = rayStartPoint[0] < (myXPos - this.halfWidth);
    let startIsRight = rayStartPoint[0] > myXPos + this.halfWidth;
    let startIsAbove = rayStartPoint[1] > myYPos + this.halfHeight;
    let startIsBelow = rayStartPoint[1] < myYPos - this.halfHeight;
    let endIsLeft = rayEndPoint[0] < myXPos - this.halfWidth;
    let endIsRight = rayEndPoint[0] > myXPos + this.halfWidth;
    let endIsAbove = rayEndPoint[1] > myXPos + this.halfHeight;
    let endIsBelow = rayEndPoint[1] < myXPos - this.halfHeight;
    //console.log("startLeft: " + startIsLeft);
    //console.log("rayStartPoint[0]: " + rayStartPoint[0]);
    //console.log("myXPos - this.halfwidth: " + (myXPos - this.halfWidth)); // cause of this???????????????????

    if (startIsLeft && endIsLeft) {
        return false;
    } else if (startIsRight && endIsRight) {
        return false;
    } else if (startIsAbove && endIsAbove) {
        return false;
    } else if (startIsBelow && endIsBelow) {
        return false;
    } else {

        for (let i = 0; i < this.corners.length; i++) {
            if (line[0] * this.corners[i][0] + line[1] > this.corners[i][1]) {
                cornerTracker.push(0);
            } else if (line[0] * this.corners[i][0] + line[1] < this.corners[i][1]) {
                cornerTracker.push(1);
            } else {
                return true;
            }
        }
        //TODO: make optimizations. dont need the second for loop.
        for (let i = 0; i < cornerTracker.length - 1; i++) {
            if (cornerTracker[i] !== cornerTracker[i + 1]) {
                return true;
            }
        }
    }
    return false;
}; 

BoundingRaycastBox.prototype.getCorners = function () { return this.corners; };
BoundingRaycastBox.prototype.getLeftChild = function () { return this.leftChild; };
BoundingRaycastBox.prototype.getRightChild = function () { return this.rightChild; };
BoundingRaycastBox.prototype.setLeftChild = function (child) { this.leftChild = child; };
BoundingRaycastBox.prototype.setRightChild = function (child) { this.leftChild = child; };
BoundingRaycastBox.prototype.getGameObjectsArray = function () { return this.myGameObjectsArray; };

BoundingRaycastBox.prototype.setGameObjectsArray = function (gameObjectsArray) { 
    console.log("myGOs array: " + gameObjectsArray);
    this.myGameObjectsArray = Object.assign(gameObjectsArray);
};