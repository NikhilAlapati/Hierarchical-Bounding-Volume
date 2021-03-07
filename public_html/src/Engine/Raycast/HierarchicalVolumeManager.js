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

    // Create 1 volume that covers all the gameobjects
    // Check the rules listed above
    // if rules fail, create new volume nodes to add to the BVH
    // keep creating nodes until each node satisfies the rules above

    // create 1 node that covers all gameobjects
    // first check the positions of all gameobjects to determine the size and location
    this.insertNode(new BoundingRaycastBox([40, 50], 4, 4)); // INCOMPLETE, replace with helper functions

    this.constructHierarchyHelper(objectsArray, this.headNode);
};

// Gabe: helper methods to look at all boundaries and create more accordingly
HierarchicalVolumeManager.prototype.constructHierarchyHelper = function (objectsArray, node) {
    // now see if there are more than three in the box, but the volume isnt too small
    if (objectsArray.length > 3) {
        var newNodePosition = this.findNewNodePosition(objectsArray, node);
        var newNodeSize = this.findNewNodeSize();

        var newNodeGOArray = [];
        for (var i = 0; i < objectsArray.length; i++) {
            if (this.previousSplitWasVirtical) {
                if (objectsArray[i].getXform().getXPos() <= newNodePosition[0]) {
                    // remove it from the objectsarray and put it in the newNodeGOArray
                }
            } else { // if (!this.previousSplitWasVertical)
                if (objectsArray[i].getXform().getYPos() <= newNodePosition[1]) {
                    // remove it from the objectsarray and put it in the newNodeGOArray
                }
            }
        }
    }
};

// Gabe: find position of a new node based on the GO in its zone
HierarchicalVolumeManager.prototype.findNewNodePosition = function (objectsArray, node) {
    var distanceX = 0;
    var distanceY = 0;
    var cumulativeWCPosition = [0, 0];
    for (var i = 0; i < objectsArray.length; i++) {
        var objPos = objectsArray[i].getXform().getWCPosition();
        var xPos = objPos[0];
        var yPos = objPos[1]
        distanceX += Math.abs(xPos);
        distanceY += Math.abs(yPos);
        cumulativeWCPosition[0] += xPos;
        cumulativeWCPosition[1] += yPos;
    }
    var averageWCPosition = [0, 0];
    averageWCPosition[0] = cumulativeWCPosition[0] / objectsArray.length;
    averageWCPosition[1] = cumulativeWCPosition[1] / objectsArray.length;
    if (node !== this.headNode) {
        if (this.previousSplitWasVirtical === null) {
            this.previousSplitWasVirtical = this.determineSplitDirection(distanceX, distanceY);
        } else if (this.previousSplitWasVirtical) {
            this.previousSplitWasVirtical = false;
        } else {
            this.previousSplitWasVirtical = true;
        }
    }
    return averageWCPosition;
};

// return true of the split is vertical, return false if the split is horizontal
HierarchicalVolumeManager.prototype.determineSplitDirection = function (distanceX, distanceY) {
    if (distanceX >= distanceY) {
        return true
    }
    return false;
};

// find the size to fit the objects inside of the volume node
HierarchicalVolumeManager.prototype.findNewNodeSize = function () {

};

// to insert nodes into the BVH
HierarchicalVolumeManager.prototype.insertNode = function (node) {
    if (this.headNode === null) {
        this.headNode = node;
        this.hierarchyDepth++;
    } else {
        this.insertNodeHelper(this.headNode, node);
    }
};

// insert nodes into the BVH helper function
HierarchicalVolumeManager.prototype.insertNodeHelper = function (parentNode, node) {

};

