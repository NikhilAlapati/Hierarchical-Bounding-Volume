/* 
 * File: Transform.js
 * Encapsulates the matrix transformation functionality, meant to work with
 * Renderable
 */

/*jslint node: true, vars: true */
/*global gEngine: false, vec2: false, Math: false, mat4: false, vec3: false */
/* find out more about jslint: http://www.jslint.com/help.html */
"use strict";

function Transform() {
    this.mPosition = vec2.fromValues(0, 0); // this is the translation
    this.mScale = vec2.fromValues(1, 1);    // this is the width (x) and height (y)
    this.mZ = 0.0;                          // must be a positive number, larger is closer to eye
    this.mRotationInRad = 0.0;              // in radians!
    
    // Gabe: variables for checkng raycast interception
    this.halfHeight = this.getHeight()/2;
    this.halfWidth = this.getWidth()/2;
    let position = this.getPosition();
    this.corners = [
        [position[0] - this.halfWidth, position[1] + this.halfHeight],// T left
        [(position[0] + this.halfWidth), position[1] + this.halfHeight],// T right
        [position[0] - this.halfWidth, position[1] - this.halfHeight],// B left
        [position[0] + this.halfWidth, position[1] - this.halfHeight]];// B right
}

Transform.prototype.cloneTo = function (aXform) {
    aXform.mPosition = vec2.clone(this.mPosition);
    aXform.mScale = vec2.clone(this.mScale);
    aXform.mZ = this.mZ;
    aXform.mRotationInRad = this.mRotationInRad;
};
// <editor-fold desc="Public Methods">

//<editor-fold desc="Setter/getter methods">
// // <editor-fold desc="Position setters and getters ">
Transform.prototype.setPosition = function (xPos, yPos) { this.setXPos(xPos); this.setYPos(yPos); };
Transform.prototype.getPosition = function () { return this.mPosition; };
Transform.prototype.get3DPosition = function () {
    return vec3.fromValues(this.getXPos(), this.getYPos(), this.getZPos());
};
Transform.prototype.getXPos = function () { return this.mPosition[0]; };
Transform.prototype.setXPos = function (xPos) { this.mPosition[0] = xPos; };
Transform.prototype.incXPosBy = function (delta) { this.mPosition[0] += delta; };
Transform.prototype.getYPos = function () { return this.mPosition[1]; };
Transform.prototype.setYPos = function (yPos) { this.mPosition[1] = yPos; };
Transform.prototype.incYPosBy = function (delta) { this.mPosition[1] += delta; };
Transform.prototype.setZPos = function (d) { this.mZ = d; };
Transform.prototype.getZPos = function () { return this.mZ; };
Transform.prototype.incZPosBy = function (delta) { this.mZ += delta; };
//</editor-fold>

// <editor-fold desc="size setters and getters">
Transform.prototype.setSize = function (width, height) {
    this.setWidth(width);
    this.setHeight(height);
};
Transform.prototype.getSize = function () { return this.mScale; };
Transform.prototype.incSizeBy = function (delta) {
    this.incWidthBy(delta);
    this.incHeightBy(delta);
};
Transform.prototype.getWidth = function () { return this.mScale[0]; };
Transform.prototype.setWidth = function (width) { this.mScale[0] = width; };
Transform.prototype.incWidthBy = function (delta) { this.mScale[0] += delta; };
Transform.prototype.getHeight = function () { return this.mScale[1]; };
Transform.prototype.setHeight = function (height) { this.mScale[1] = height; };
Transform.prototype.incHeightBy = function (delta) { this.mScale[1] += delta; };
//</editor-fold>

// <editor-fold desc="rotation getters and setters">
Transform.prototype.setRotationInRad = function (rotationInRadians) {
    this.mRotationInRad = rotationInRadians;
    while (this.mRotationInRad > (2 * Math.PI)) {
        this.mRotationInRad -= (2 * Math.PI);
    }
};
Transform.prototype.setRotationInDegree = function (rotationInDegree) {
    this.setRotationInRad(rotationInDegree * Math.PI / 180.0);
};
Transform.prototype.incRotationByDegree = function (deltaDegree) {
    this.incRotationByRad(deltaDegree * Math.PI / 180.0);
};
Transform.prototype.incRotationByRad = function (deltaRad) {
    this.setRotationInRad(this.mRotationInRad + deltaRad);
};
Transform.prototype.getRotationInRad = function () {  return this.mRotationInRad; };
Transform.prototype.getRotationInDegree = function () { return this.mRotationInRad * 180.0 / Math.PI; };
    //</editor-fold>
//</editor-fold>
//
// returns the matrix the concatenates the transformations defined
Transform.prototype.getXform = function () {
    // Creates a blank identity matrix
    var matrix = mat4.create();

    // The matrices that WebGL uses are transposed, thus the typical matrix
    // operations must be in reverse.

    // Step A: compute translation, for now z is the mHeight
    mat4.translate(matrix, matrix, this.get3DPosition());
    // Step B: concatenate with rotation.
    mat4.rotateZ(matrix, matrix, this.getRotationInRad());
    // Step C: concatenate with scaling
    mat4.scale(matrix, matrix, vec3.fromValues(this.getWidth(), this.getHeight(), 1.0));

    return matrix;
};
//</editor-fold>

Transform.prototype.checkIntersection = function (raycast) {
    this.halfHeight = this.getHeight()/2;
    this.halfWidth = this.getWidth()/2;
    let position = this.getPosition();
    this.corners = [
        [position[0] - this.halfWidth, position[1] + this.halfHeight],// T left
        [(position[0] + this.halfWidth), position[1] + this.halfHeight],// T right
        [position[0] - this.halfWidth, position[1] - this.halfHeight],// B left
        [position[0] + this.halfWidth, position[1] - this.halfHeight]];// B right
    let rayEndPoint = raycast.getEndPoint();
    let rayStartPoint = raycast.getStartPoint();
    var corners = this.corners;
    var left = [corners[0][0], corners[0][1], corners[2][0], corners[2][1]];
    var right = [corners[1][0], corners[1][1], corners[3][0], corners[3][1]];
    var top = [corners[0][0], corners[0][1], corners[1][0], corners[1][1]];
    var bot = [corners[2][0], corners[2][1], corners[3][0], corners[3][1]];
    var allBorders = [left, right, top, bot];
    for (var i = 0; i < 4; i++) {
        if (this.linesIntersect(rayStartPoint[0], rayStartPoint[1],
                                rayEndPoint[0], rayEndPoint[1],
                                allBorders[i][0], allBorders[i][1],
                                allBorders[i][2], allBorders[i][3])) {
            return true;
        }
    }
    return false;
};

// sourced from: 
// https://gist.github.com/Joncom/e8e8d18ebe7fe55c3894
// checks if two lines intersect
// parameters:
// line 1 start x and y, line 1 end x and y, similarly line 2
Transform.prototype.linesIntersect = function(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return true;
    }
    return false; // No collision
};

Transform.prototype.getCorners = function () { return this.corners; };