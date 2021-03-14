/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Constructs a raycast given a start and endpoint
function Raycast(startPoint, endPoint) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.myLineRenderable = new LineRenderable(this.startPoint[0], this.startPoint[1], this.endPoint[0], this.endPoint[1]);
    this.mEquationSlope = null;
    this.mIntercept = null;
    this.updateLine();
}

// Inheritance
gEngine.Core.inheritPrototype(Raycast, LineRenderable);
// Getters and Setters
Raycast.prototype.getStartPoint = function () {
    return this.startPoint;
};
Raycast.prototype.getEndPoint = function () {
    return this.endPoint;
};

Raycast.prototype.setRayColor = function (color) {
    this.myLineRenderable.setColor(color);
};

Raycast.prototype.setStartPoint = function (newPoint) {
    this.startPoint = newPoint;
    this.myLineRenderable.setFirstVertex(this.startPoint[0], this.startPoint[1]);
};
Raycast.prototype.setEndPoint = function (newPoint) {
    this.endPoint = newPoint;
    this.myLineRenderable.setSecondVertex(this.endPoint[0], this.endPoint[1]);
};
// Draws given a camera
Raycast.prototype.draw = function (aCamera) {
    this.myLineRenderable.draw(aCamera);
};
Raycast.prototype.getLine = function () {
    return [this.mEquationSlope, this.mIntercept];
};
Raycast.prototype.getMagnitude = function () {
    return Math.sqrt(Math.pow(this.endPoint[1] - this.startPoint[1], 2) + Math.pow(this.endPoint[0] - this.startPoint[0], 2));
};
// Updates the equation of the raycast
Raycast.prototype.updateLine = function () {
    this.mEquationSlope = (this.endPoint[1] - this.startPoint[1]) / (this.endPoint[0] - this.startPoint[0]);
    this.mIntercept = this.startPoint[1] - (this.mEquationSlope * this.startPoint[0]);
};
// Updates the line and checkHeadNodeIntercept
Raycast.prototype.update = function (headNode) {
    this.updateLine();
    return this.checkHeadNodeIntercept(headNode);
};
// Checks if a raycast intercepts a node
Raycast.prototype.checkHeadNodeIntercept = function (headNode) {
    if (headNode !== null) {
        if (headNode.checkIntersection(this)) {
            var gOsIntercepted = [];
            this.interceptionHelper(headNode, gOsIntercepted);
            return gOsIntercepted;
        }
    }
    return null;
};
// Helper for check node intercepts
Raycast.prototype.interceptionHelper = function (node, gOsIntercepted) {
    if (node.checkIntersection(this)) {
        if (node.hasChildren()) {
            this.interceptionHelper(node.getLeftChild(), gOsIntercepted);
            this.interceptionHelper(node.getRightChild(), gOsIntercepted);
        } else {
            this.checkGOsIntercepts(node, gOsIntercepted);
        }
    }
};

Raycast.prototype.hasChildren = function (node) {
    return (node.getLeftChild() !== null);// && node.getRightChild() !== null) {
};
// Checks if any game objects that the node owns is intercepted
Raycast.prototype.checkGOsIntercepts = function (node, gOsIntercepted) {
    for (var i = 0; i < node.getGameObjectsArray().length; i++) {
        var gameObj = node.getGameObjectsArray()[i];
        if (gameObj.checkIntersection(this)) {
            gOsIntercepted.push(gameObj);
        }
    }
};