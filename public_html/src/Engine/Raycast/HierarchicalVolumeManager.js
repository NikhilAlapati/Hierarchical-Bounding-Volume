/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function HierarchicalVolumeManager() {
    this.headNode = null;
    this.hierarchyDepth = 0;
}

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