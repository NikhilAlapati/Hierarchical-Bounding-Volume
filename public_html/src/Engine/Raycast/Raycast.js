/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Raycast (startPoint, endPoint) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.myLineRenderable = new LineRenderable(this.startPoint[0], this.startPoint[1], this.endPoint[0], this.endPoint[1]);
}

gEngine.Core.inheritPrototype(Raycast, LineRenderable);

Raycast.prototype.getStartPoint = function () { return this.startPoint; };
Raycast.prototype.getEndPoint = function () { return this.endPoint; };

Raycast.prototype.setStartPoint = function (newPoint) { 
    this.startPoint = newPoint;
    this.myLineRenderable.setFirstVertex(this.startPoint[0], this.startPoint[1]);
};
Raycast.prototype.setEndPoint = function (newPoint) {
    this.startPoint = newPoint;
    this.myLineRenderable.setFirstVertex(this.endPoint[0], this.endPoint[1]);
};

Raycast.prototype.draw = function (aCamera) { this.myLineRenderable.draw(aCamera); };

Raycast.prototype.update = function () {

};