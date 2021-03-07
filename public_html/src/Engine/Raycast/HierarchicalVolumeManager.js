/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function HierarchicalVolumeManager(objectsArray) {
    this.headNode = null;
    this.hierarchyDepth = 0;
    this.previousSplitWasVirtical = null;
    this.constructHierarchy(objectsArray);
}

// Gabe: testing how to build a hierarchy
HierarchicalVolumeManager.prototype.constructHierarchy = function (objectsArray) {
    // read through all the positions of the gameobjects
    // make an average coordinate position of all the gameobjects
    // make an sum distance from the WCOrigin of x and y values
    // if distanceX > distanceY, make a split on the x axis
    // if distanceX < distanceY, make a split on the y axis

    // Temporary rules to build volumes:
    // 1. The number of objects in any one volume is greater than 3
    // 2. Do not need to split a volume to two if there is a volume 
    //    with more than 3 objects, but the area of the volume is
    //    <INSERT ARBITRARY SMALL AREA SIZE>.

    if (objectsArray.length > 3) {
        var distanceX = 0;
        var distanceY = 0;
        var averageWCPosition = [];

        for (var i = 0; i < objectsArray.length - 1; i += 2) {
            obj1Pos = objectsArray[i].getXform().getWCPosition;
            distanceX += Math.abs(obj1Pos[0]);
            distanceY += Math.abs(obj1Pos[1]);

            obj2Pos = objectsArray[i + 1].getXform().getWCPosition;
            distanceX += Math.abs(obj2Pos[0]);
            distanceY += Math.abs(obj2Pos[1]);

            averageWCPosition[0] += ((obj1Pos[0] + obj2Pos[0]) / 2);
            averageWCPosition[1] += ((obj1Pos[1] + obj2Pos[1]) / 2);
        }

        this.constructHierarchyHelper();

    } else {
        // build one volume that covers all of them
    }
};

// Gabe: helper methods to look at all boundaries and create more accordingly
HierarchicalVolumeManager.prototype.constructHierarchyHelper = function () {

};

HierarchicalVolumeManager.prototype.insertNode = function (node) {
    if (this.headNode === null) {
        this.headNode = node;
        this.hierarchyDepth++;
    } else {
        this.insertNodeHelper(this.headNode, node);
    }
};

HierarchicalVolumeManager.prototype.insertNodeHelper = function (parentNode, node) {

};

