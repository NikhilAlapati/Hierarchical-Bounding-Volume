/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Given an array of objects it creates a hierarchy of game objects and bounding boxes
function HierarchicalVolumeManager(objectsArray) {
    this.mObjs = objectsArray;
    this.headNode = null;
    this.hierarchyNodesArray = null;
    this.previousSplitWasVirtical = null;
    this.constructHierarchy(objectsArray);
}

// Creates a hierarchy recursively given an object of game objects
HierarchicalVolumeManager.prototype.constructHierarchy = function (objectsArray) {
    if (objectsArray.length > 0) {
        var headNodeSize = this.findNewNodeSize(objectsArray);
        this.headNode = new BoundingRaycastBox(this.findNewNodePosition(objectsArray), headNodeSize[0], headNodeSize[1]);
        this.headNode.setGameObjectsArray(objectsArray);

        this.hierarchyNodesArray = [this.headNode];
        // construct the rest of the hierarchy
        if (objectsArray.length > 3) {
            this.constructHierarchyHelper(Object.assign(objectsArray), this.headNode);
        }
    }
};

// Helper function for the constructHierarchy to help with the recursive creation
HierarchicalVolumeManager.prototype.constructHierarchyHelper = function (objectsArray, node) {
    // now see if there are more than three in the box
    if (objectsArray.length > 3) {
        // split the GOs into two groups to assign to two children
        var averageGOsPosition = this.findAverageGOsPosition(objectsArray, node);
        var newNodeGOArrays = this.moveGOsToNewArrays(objectsArray, averageGOsPosition);

        // create the children nodes
        var child1 = new BoundingRaycastBox([0, 0], 0, 0);
        var child2 = new BoundingRaycastBox([0, 0], 0, 0);

        // find the children's WC positions
        var newNode1Position = this.findNewNodePosition(newNodeGOArrays[0], child1);
        var newNode2Position = this.findNewNodePosition(newNodeGOArrays[1], child2);
        child1.getXform().setPosition(newNode1Position[0], newNode1Position[1]);
        child2.getXform().setPosition(newNode2Position[0], newNode2Position[1]);

        // find the children's sizes
        var newNode1Size = this.findNewNodeSize(newNodeGOArrays[0], child1);
        var newNode2Size = this.findNewNodeSize(newNodeGOArrays[1], child2);
        child1.getXform().setSize(newNode1Size[0], newNode1Size[1]);
        child2.getXform().setSize(newNode2Size[0], newNode2Size[1]);

        // asign children to the parent node
        node.setLeftChild(Object.assign(child1));
        node.setRightChild(Object.assign(child2));
        child1.setParent(node);
        child2.setParent(node);
        this.hierarchyNodesArray.push(child1);
        this.hierarchyNodesArray.push(child2);

        // asign GOs to children nodes
        child1.setGameObjectsArray(newNodeGOArrays[0]);
        child2.setGameObjectsArray(newNodeGOArrays[1]);

        // recurse into children
        this.constructHierarchyHelper(newNodeGOArrays[0], child1);
        this.constructHierarchyHelper(newNodeGOArrays[1], child2);
    }
};

// move the GOs from the passed array to a new array for a new node
HierarchicalVolumeManager.prototype.moveGOsToNewArrays = function (objectsArray, averageGOsPosition) {

    var newNode1GOArray = [];
    var newNode2GOArray = [];
    var tempArrayStorage = [newNode1GOArray, newNode2GOArray];
    for (var i = 0; i < objectsArray.length; i++) {
        if (this.previousSplitWasVirtical) {
            if (objectsArray[i].getXform().getXPos() <= averageGOsPosition[0]) {
                // remove it from the objectsarray and put it in the newNodeGOArray
                newNode1GOArray.push(objectsArray[i]);
                //objectsArray.splice(i, 1);
            } else {
                // remove it from the objectsarray and put it in the newNodeGOArray
                newNode2GOArray.push(objectsArray[i]);
                //objectsArray.splice(i, 1);
            }
        } else { // if (!this.previousSplitWasVertical)
            if (objectsArray[i].getXform().getYPos() <= averageGOsPosition[1]) {
                // remove it from the objectsarray and put it in the newNodeGOArray
                newNode1GOArray.push(objectsArray[i]);
                //objectsArray.splice(i, 1);
            } else {
                // remove it from the objectsarray and put it in the newNodeGOArray
                newNode2GOArray.push(objectsArray[i]);
                //objectsArray.splice(i, 1);
            }
        }
    }
    return tempArrayStorage;
};

// Finds the average position of the game objects in the array so that the program is able to create new bounding boxes
HierarchicalVolumeManager.prototype.findAverageGOsPosition = function (objectsArray, node) {
    var distanceX = 0;
    var distanceY = 0;
    var cumulativeWCPosition = [0, 0];
    for (var i = 0; i < objectsArray.length; i++) {
        var objPos = objectsArray[i].getXform().getPosition();
        var xPos = objPos[0];
        var yPos = objPos[1];
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
        return true;
    }
    return false;
};

HierarchicalVolumeManager.prototype.findNewNodePosition = function (objectsArray) {
    var furthestHighObj = objectsArray[0];
    var furthestLowObj = objectsArray[0];
    var furthestLeftObj = objectsArray[0];
    var furthestRightObj = objectsArray[0];

    //var cumulativeWCPosition = [0, 0];
    for (var i = 0; i < objectsArray.length; i++) {
        /*var objPos = objectsArray[i].getXform().getPosition();
        var xPos = objPos[0];
        var yPos = objPos[1];
        cumulativeWCPosition[0] += xPos;
        cumulativeWCPosition[1] += yPos;*/

        if ((objectsArray[i].getXform().getXPos() + (objectsArray[i].getXform().getWidth() / 2)) >
            (furthestRightObj.getXform().getXPos() + (furthestRightObj.getXform().getWidth() / 2))) {
            furthestRightObj = objectsArray[i];
        }
        if ((objectsArray[i].getXform().getXPos() - (objectsArray[i].getXform().getWidth() / 2)) <
            (furthestLeftObj.getXform().getXPos() - (furthestLeftObj.getXform().getWidth() / 2))) {
            furthestLeftObj = objectsArray[i];
        }

        if ((objectsArray[i].getXform().getYPos() + (objectsArray[i].getXform().getHeight() / 2)) >
            (furthestHighObj.getXform().getYPos() + (furthestHighObj.getXform().getHeight() / 2))) {
            furthestHighObj = objectsArray[i];
        }
        if ((objectsArray[i].getXform().getYPos() - (objectsArray[i].getXform().getHeight() / 2)) <
            (furthestLowObj.getXform().getYPos() - (furthestLowObj.getXform().getHeight() / 2))) {
            furthestLowObj = objectsArray[i];
        }
    }
    var averageWCPosition = [0, 0];
    //averageWCPosition[0] = cumulativeWCPosition[0] / objectsArray.length;
    averageWCPosition[0] = (((furthestRightObj.getXform().getXPos() + (furthestRightObj.getXform().getWidth() / 2)) -
        (furthestLeftObj.getXform().getXPos() - (furthestLeftObj.getXform().getWidth() / 2))) / 2) +
        (furthestLeftObj.getXform().getXPos() - (furthestLeftObj.getXform().getWidth() / 2));

    //averageWCPosition[1] = cumulativeWCPosition[1] / objectsArray.length;
    averageWCPosition[1] = (((furthestHighObj.getXform().getYPos() + (furthestHighObj.getXform().getHeight() / 2)) -
        (furthestLowObj.getXform().getYPos() - (furthestLowObj.getXform().getHeight() / 2))) / 2) +
        (furthestLowObj.getXform().getYPos() - (furthestLowObj.getXform().getHeight() / 2));
    return averageWCPosition;
};

// find the size to fit the objects inside of the volume node
HierarchicalVolumeManager.prototype.findNewNodeSize = function (objectsArray) {
    var xform = objectsArray[0].getXform();
    var left = xform.getXPos() - xform.getWidth() / 2;
    var right = xform.getXPos() + xform.getWidth() / 2;
    var top = xform.getYPos() + xform.getHeight() / 2;
    var bottom = xform.getYPos() - xform.getHeight() / 2;

    for (var i = 0; i < objectsArray.length; i++) {
        xform = objectsArray[i].getXform();
        cLeft = xform.getXPos() - xform.getWidth() / 2;
        cRight = xform.getXPos() + xform.getWidth() / 2;
        cTop = xform.getYPos() + xform.getHeight() / 2;
        cBottom = xform.getYPos() - xform.getHeight() / 2;
        if (cLeft < left) {
            left = cLeft;
        }
        if (cRight > right) {
            right = cRight;
        }
        if (cTop > top) {
            top = cTop;
        }
        if (cBottom < bottom) {
            bottom = cBottom;
        }
    }

    var solutionWidth = Math.abs(right - left);
    var solutionHeight = Math.abs(top - bottom);
    return [solutionWidth, solutionHeight];
};

HierarchicalVolumeManager.prototype.getHeadNode = function () {
    return this.headNode;
};
HierarchicalVolumeManager.prototype.getHierarchyArray = function () {
    return this.hierarchyNodesArray;
};
HierarchicalVolumeManager.prototype.getChildrenOfParent = function (node) {
    return [node.getLeftChild(), node.getRightChild()];
};
HierarchicalVolumeManager.prototype.parentIsHeadNode = function (node) {
    return node.getParent() === this.headNode;
};