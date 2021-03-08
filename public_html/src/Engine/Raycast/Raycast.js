/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Raycast(startPoint, endPoint) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.myLineRenderable = new LineRenderable(this.startPoint[0], this.startPoint[1], this.endPoint[0], this.endPoint[1]);
    this.mEquationSlope = null;
    this.mIntercept = null;
    this.updateLine();
}

gEngine.Core.inheritPrototype(Raycast, LineRenderable);

Raycast.prototype.getStartPoint = function () {
    return this.startPoint;
};
Raycast.prototype.getEndPoint = function () {
    return this.endPoint;
};

Raycast.prototype.setRayColor = function(color) {
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

Raycast.prototype.draw = function (aCamera) {
    this.myLineRenderable.draw(aCamera);
};
Raycast.prototype.updateLine = function () {
    this.mEquationSlope = (this.endPoint[1] - this.startPoint[1]) / (this.endPoint[0] - this.startPoint[0]);
    this.mIntercept = this.startPoint[1] - (this.mEquationSlope * this.startPoint[0]);
};
Raycast.prototype.getLine = function () {
    return [this.mEquationSlope, this.mIntercept];
};
Raycast.prototype.getMagnitude = function () {
    return Math.sqrt(Math.pow(this.endPoint[1] - this.startPoint[1], 2) + Math.pow(this.endPoint[0] - this.startPoint[0], 2));
};
Raycast.prototype.update = function () {
    this.updateLine();
};