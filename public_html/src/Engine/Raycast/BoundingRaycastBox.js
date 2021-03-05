/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function BoundingRaycastBox(centerPos, w, h) {
    this.kSpriteSheetTexture = "assets/minion_sprite.png";
    this.boundRend = new Renderable(this.kSpriteSheetTexture);
    this.boundRend.getXform().setSize(7.5, 7.5);
    this.boundRend.getXform().setPosition(centerPos[0], centerPos[1]);
    this.boundRend.setColor([1, 1, 1, 1]);
    //this.boundRend.setElementUVCoordinate(0.15, 0.3, 0, 0.4);
    this.myGameObject = new GameObject(this.boundRend);
    
    this.myBoundingBox = new BoundingBox(centerPos, w, h);
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

