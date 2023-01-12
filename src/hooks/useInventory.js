import React from "react";

const useInventory = linkFn => ([id, quantity]) => (<React.Fragment><span className="InventoryQuantity">{quantity}</span> {linkFn(id)}</React.Fragment>);

export default useInventory;
