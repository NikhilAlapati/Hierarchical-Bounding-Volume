/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function HierarchicalVolumeManager(objectsArray) {
    this.mObjs = objectsArray;
    this.headNode = null;
    this.hierarchyNodesArray = null;
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
    //this.insertNode(new BoundingRaycastBox([40, 50], 4, 4)); // INCOMPLETE, replace with helper functions
    
    // Create the head node
    if (objectsArray.length > 0) {
        console.log("More than 0 objs");
        var headNodeSize = this.findNewNodeSize(objectsArray);
        this.headNode = new BoundingRaycastBox(this.findNewNodePosition(objectsArray), headNodeSize[0], headNodeSize[1]);
        
        this.hierarchyNodesArray = [this.headNode];
        // construct the rest of the hierarchy
        if (objectsArray.length > 3) {
            console.log("More than 3 objs");
            this.constructHierarchyHelper(objectsArray, this.headNode);
        }
    }
    
};

// Gabe: helper methods to look at all boundaries and create more accordingly
// Gabe: take a node, see if it breaks the rules above. create and split the array
//       of GOs into two NEW nodes. Then find the positions and sizes of the nodes 
//       after (this may be done on the node side of code (BoundingRaycastBox.js)).
HierarchicalVolumeManager.prototype.constructHierarchyHelper = function (objectsArray, node) {
    // now see if there are more than three in the box, but the volume isnt too small
    if (objectsArray.length > 3) {
        
        var averageGOsPosition = this.findAverageGOsPosition(objectsArray, node);
        var newNodeGOArrays = this.moveGOsToNewArrays(objectsArray, averageGOsPosition);
        var child1 = new BoundingRayCastBox([0, 0], 0, 0);
        var child2 = new BoundingRayCastBox([0, 0], 0, 0);
        
        var newNode1Position = this.findNewNodePosition(newNodeGOArrays[0], child1);
        var newNode2Position = this.findNewNodePosition(newNodeGOArrays[1], child2);
        child1.getXform().setPosition(newNode1Position[0], newNode1Position[1]);
        child2.getXform().setPosition(newNode2Position[0], newNode2Position[1]);
        
        var newNode1Size = this.findNewNodeSize(newNodeGOArrays[0], child1);
        var newNode2Size = this.findNewNodeSize(newNodeGOArrays[1], child2);
        child1.getXform().setSize(newNode1Size[0], newNode1Size[1]);
        child2.getXform().setSize(newNode2Size[0], newNode2Size[1]);
        
        // asign children to the parent node
        node.setLeftChild(child1);
        node.setRightChild(child2);
        this.hierarchyNodesArray.push(child1);
        this.hierarchyNodesArray.push(child2);
        
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
            }
            else {
                // remove it from the objectsarray and put it in the newNodeGOArray
                newNode2GOArray.push(objectsArray[i]);
                //objectsArray.splice(i, 1);
            }
        }
    }
    return tempArrayStorage;
};

// Gabe: this is not an accurate function name, this is finding the which direction
//       to split and where the cutoff coordinate is for splitting GOs into a new array
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
    var cumulativeWCPosition = [0, 0];
    for (var i = 0; i < objectsArray.length; i++) {
        var objPos = objectsArray[i].getXform().getPosition();
        var xPos = objPos[0];
        var yPos = objPos[1];
        cumulativeWCPosition[0] += xPos;
        cumulativeWCPosition[1] += yPos;
    }
    var averageWCPosition = [0, 0];
    averageWCPosition[0] = cumulativeWCPosition[0] / objectsArray.length;
    averageWCPosition[1] = cumulativeWCPosition[1] / objectsArray.length;
    return averageWCPosition;
};

// find the size to fit the objects inside of the volume node
HierarchicalVolumeManager.prototype.findNewNodeSize = function (objectsArray) {
    var xform = objectsArray[0].getXform();
    var left = xform.getXPos() - xform.getWidth()/2;
    var right = xform.getXPos() + xform.getWidth()/2;
    var top = xform.getYPos() + xform.getHeight()/2;
    var bottom = xform.getYPos() - xform.getHeight()/2;
    
    for (var i = 0; i < objectsArray.length; i++) {
        xform = objectsArray[i].getXform();
        cLeft = xform.getXPos() - xform.getWidth()/2;
        cRight = xform.getXPos() + xform.getWidth()/2;
        cTop = xform.getYPos() + xform.getHeight()/2;
        cBottom = xform.getYPos() - xform.getHeight()/2;
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

HierarchicalVolumeManager.prototype.getHeadNode = function () { return this.headNode; };
HierarchicalVolumeManager.prototype.getHierarchyArray = function () {return this.hierarchyNodesArray; };
HierarchicalVolumeManager.prototype.getChildrenOfParent = function (node) { return [node.getLeftChild(), node.getRightChild()]; };