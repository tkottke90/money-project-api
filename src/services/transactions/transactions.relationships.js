module.exports = {
  /**
   * Function is designed to update categories current value and generate state information for the relationship between a Transaction and a Category 
   * @param {Object} data Data object that is used by the the 
   */
  category: async function({nodeA, nodeB, newCategory } ) {      
    // Generate Relationship Properties
    const relationshipProperties = {
      delta: nodeA.change ? nodeA.change : nodeA.current_value,
      current_value: nodeB._properties.get('current_value'),
      createdAt: new Date().toISOString()
    };

    // Update category node with new value
    if (!newCategory) {
      nodeB.update({
        id: nodeB._properties.get('id'),
        name: nodeB._properties.get('name'),
        current_value: nodeB._properties.get('current_value') + nodeA.change 
      });
    }

    // Return properties to be applied to relationship
    return relationshipProperties;
  }
};