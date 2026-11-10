/**
 * The embedded browser stamps data-cursor-ref onto the DOM before hydration.
 * React then reports a mismatch for an attribute the app never renders.
 * Strip those stamps until the app has hydrated, then leave later ones alone.
 */
export const CURSOR_REF_GUARD_SCRIPT = `(function(){try{var ATTR="data-cursor-ref";function strip(node){if(!node||node.nodeType!==1)return;if(node.hasAttribute(ATTR))node.removeAttribute(ATTR);var list=node.querySelectorAll("["+ATTR+"]");for(var i=0;i<list.length;i++)list[i].removeAttribute(ATTR)}var root=document.documentElement;var obs=new MutationObserver(function(records){for(var i=0;i<records.length;i++){var rec=records[i];if(rec.type==="attributes"&&rec.target&&rec.target.removeAttribute)rec.target.removeAttribute(ATTR);var nodes=rec.addedNodes;if(!nodes)continue;for(var j=0;j<nodes.length;j++)strip(nodes[j])}});obs.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:[ATTR]});strip(root);addEventListener("nistha-cursor-ref-release",function(){obs.disconnect()},{once:true})}catch(e){}})();`;
