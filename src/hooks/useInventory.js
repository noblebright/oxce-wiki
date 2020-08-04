import React from "react";

export default linkFn => ([id, quantity]) => (<React.Fragment><span className="InventoryQuantity">{quantity}</span> {linkFn(id)}</React.Fragment>);
