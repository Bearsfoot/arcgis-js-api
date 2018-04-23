// COPYRIGHT © 2018 Esri
//
// All rights reserved under the copyright laws of the United States
// and applicable international laws, treaties, and conventions.
//
// This material is licensed for use under the Esri Master License
// Agreement (MLA), and is bound by the terms of that agreement.
// You may redistribute and use this code without modification,
// provided you adhere to the terms of the MLA and include this
// copyright notice.
//
// See use restrictions at http://www.esri.com/legal/pdfs/mla_e204_e300/english
//
// For additional information, contact:
// Environmental Systems Research Institute, Inc.
// Attn: Contracts and Legal Services Department
// 380 New York Street
// Redlands, California, USA 92373
// USA
//
// email: contracts@esri.com
//
// See http://js.arcgis.com/4.6/esri/copyright.txt for details.

define(["require","exports","../../../../core/tsSupport/assignHelper","../../../../core/tsSupport/extendsHelper","../../../../core/promiseUtils","../../../../core/promiseUtils","../../../../core/libs/gl-matrix/mat4","../../../../core/libs/gl-matrix/vec3","../../../../geometry/Point","../../../../renderers/support/diffUtils","../Container","../StageGL","../../engine/webgl/TileData","./enums","./GeometryUtils","./rendererInfoUtils","./rendererInfoUtils","./TextureManager","./Utils","./visualVariablesUtils","./WGLPainter","./WGLRendererInfo","./WGLTile","./passes/WGLPaintPassHeatmap"],function(e,t,i,r,n,a,o,s,l,h,d,p,u,c,f,g,_,y,v,m,w,I,V,b){function C(e){for(var t in e.diff){var i=e.diff[t];if("collection"===i.type){if(0!==i.changed.length||0!==i.added.length||0!==i.removed.length)return!0}else if("visualVariables"!==t&&"authoringInfo"!==t)return!0}return!1}return function(e){function t(t){var i=e.call(this)||this;return i._container=new p,i._displayWidth=0,i._displayHeight=0,i._pointToCallbacks=new Map,i._highlightIDs=new Set,i._highlightOptionsUpToDate=!1,i.textureManager=new y,i._domContainer=null,i._parentLayerView=t,i._tileCoordinateScale=s.create(),i._orientationVec=s.create(),i._displayScale=s.create(),i._orientationVec.set([0,0,1]),i._defaultTransform=o.create(),i._tileInfoView=t.tileInfoView,i.wglRendererInfo=new I(i),i.highlightOptions=t.view.highlightOptions,i._container.useContextVersion(t.view?t.view.renderContext:null),i}return r(t,e),Object.defineProperty(t.prototype,"highlightOptions",{get:function(){return this._highlightOptions},set:function(e){this._highlightOptions=e,this._highlightOptionsUpToDate=!1},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"displayWidth",{get:function(){return this._displayWidth},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"displayHeight",{get:function(){return this._displayHeight},enumerable:!0,configurable:!0}),t.prototype.initialize=function(e){this._tileInfoView=e,this.wglRendererInfo=new I(this);var t=new w.WGLPainterOptions;this.wglRendererInfo.heatmapParameters&&t.registerPass(b.default,w.default.allGeometryPhases()),this._painterOptions=t},t.prototype.updateHeatmapParameters=function(e){this.wglRendererInfo.updateHeatmapParameters(e),this.requestRender()},t.prototype.hitTest=function(e,t){var i=this,r=[e,t];return n.create(function(e,t){i._pointToCallbacks.set(r,{resolve:e,reject:t}),i.requestRender()},function(){i._pointToCallbacks.has(r)&&i._pointToCallbacks.delete(r)})},t.prototype.setHighlight=function(e){this._highlightIDs.clear(),this.addHighlight(e)},t.prototype.setVisibility=function(e){for(var t=0,i=this.children;t<i.length;t++){i[t].setVisibility(e)}},t.prototype.addHighlight=function(e){for(var t=0,i=e;t<i.length;t++){var r=i[t];this._highlightIDs.add(r)}this._buildHLList()},t.prototype.removeHighlight=function(e){for(var t=0,i=e;t<i.length;t++){var r=i[t];this._highlightIDs.delete(r)}this._buildHLList()},t.prototype.addChild=function(t){var i=e.prototype.addChild.call(this,t);return this._buildHLList(),i},t.prototype.removeChild=function(t){var i=e.prototype.removeChild.call(this,t);return this._buildHLList(),i},t.prototype.prepareChildrenRenderParameters=function(e){this.wglRendererInfo.updateVisualVariables(this._visualVariablesInfo.vvRanges,e.state);var t=this._tileInfoView.getClosestInfoForScale(e.state.scale).level;return i({},e,{rendererInfo:this.wglRendererInfo,requiredLevel:t,drawPhase:c.WGLDrawPhase.NONE})},t.prototype.renderChildren=function(e){var t=this,i=e.painter;i.bindTextureManager(this.textureManager),this.wglRendererInfo.updateVisualVariables(this._visualVariablesInfo.vvRanges,e.state),this.sortChildren(function(e,t){return e.key.level-t.key.level}),i.draw(e,this.children,w.default.allGeometryPhases(),this._painterOptions),this._highlightIDs.size>0&&i.highlight(e,this.children),0!==this._pointToCallbacks.size&&(this._pointToCallbacks.forEach(function(i,r){i.resolve(t._hitTest(e,r[0],r[1]))}),this._pointToCallbacks.clear())},t.prototype.attachChild=function(e,t){return e.attach(t)},t.prototype.detachChild=function(e,t){e.detach(t)},t.prototype.renderChild=function(e,t){e.doRender(t)},t.prototype.beforeRenderChildren=function(e,t){this._updateTilesTransform(e.state,this._tileInfoView.getClosestInfoForScale(e.state.scale).level),this._updateHighlightOptions(),this._container.opacity=this._domContainer.opacity},t.prototype._hitTest=function(e,t,i){var r=e.painter,n=this._tileInfoView.getClosestInfoForScale(e.state.scale).level,a=[0,0];e.state.toMap(a,[t,i]);var o=e.state.clone(),s=o.viewpoint.clone();return s.targetGeometry=new l(a[0],a[1],e.state.spatialReference),o.viewpoint=s,o.size=[v.C_HITTEST_SEARCH_SIZE,v.C_HITTEST_SEARCH_SIZE],this._updateTilesTransform(o,n),r.update(o,e.pixelRatio),r.hitTest({context:e.context,painter:r,drawPhase:c.WGLDrawPhase.HITTEST,state:o,pixelRatio:e.pixelRatio,stationary:e.stationary,rendererInfo:this.wglRendererInfo,requiredLevel:n},this.children)},t.prototype._updateTilesTransform=function(e,t){var i=1/e.width,r=1/e.height,n=[0,0];this._calculateRelativeViewProjMat(this._tileInfoView.tileInfo.lods[t].resolution,e.resolution,e.rotation,this._tileInfoView.tileInfo.size[0],e.width,e.height,this._defaultTransform);for(var a=0,o=this.children;a<o.length;a++){var s=o[a];e.toScreen(n,s.coords),n[1]=e.height-n[1],s.tileTransform.displayCoord[0]=2*n[0]*i-1,s.tileTransform.displayCoord[1]=2*n[1]*r-1,s.key.level===t?s.tileTransform.transform.set(this._defaultTransform):this._calculateRelativeViewProjMat(this._tileInfoView.tileInfo.lods[s.key.level].resolution,e.resolution,e.rotation,this._tileInfoView.tileInfo.size[0],e.width,e.height,s.tileTransform.transform)}},t.prototype._calculateRelativeViewProjMat=function(e,t,i,r,n,a,s){var l=e/t,h=l;this._tileCoordinateScale.set([h,h,1]),n===this._displayWidth&&a===this._displayHeight||(this._displayScale.set([2/n,-2/a,1]),this._displayWidth=n,this._displayHeight=a),o.identity(s),o.scale(s,s,this._tileCoordinateScale),o.rotate(s,s,-i*f.C_DEG_TO_RAD,this._orientationVec),o.scale(s,s,this._displayScale),o.transpose(s,s)},t.prototype._updateHighlightOptions=function(){this._highlightOptionsUpToDate||this._setHighlightOptions(this._highlightOptions)&&(this._highlightOptionsUpToDate=!0)},t.prototype._setHighlightOptions=function(e){if(!this.parent)return!1;var t=this.parent.glPainter;if(!t)return!1;var i=e.color.toRgba();i[0]/=255,i[1]/=255,i[2]/=255;var r=i.slice();return i[3]*=e.fillOpacity,r[3]*=e.haloOpacity,t.setHighlightOptions({fillColor:i,outlineColor:r,outlineWidth:2,outerHaloWidth:.3,innerHaloWidth:.3,outlinePosition:0}),!0},t.prototype._buildHLList=function(){for(var e=0,t=this.children;e<t.length;e++){t[e].buildHLList(this._highlightIDs)}this.requestRender()},t.prototype.highlight=function(e){var t=this;return t.addHighlight(e),{remove:function(){t.removeHighlight(e)}}},t.prototype.install=function(e){e.addChild(this._container),this._container.addChild(this),this._domContainer=e},t.prototype.uninstall=function(e){e.removeChild(this._container),this._container.removeChild(this),this._domContainer=null},t.prototype.getMaterialItems=function(e){var t=e;if(t&&0!==t.length){for(var i=[],r=0,n=t;r<n.length;r++){var o=n[r];i.push(this.textureManager.rasterizeItem(o.symbol,o.glyphIds))}return a.all(i).then(function(e){return e.map(function(e,t){return{id:t,mosaicItem:e}})})}},t.prototype.getProcessorConfiguration=function(){return{type:"symbol",renderer:this._parentLayerView.layer.renderer.toJSON(),devicePixelRatio:window.devicePixelRatio||1,definitionExpression:this._parentLayerView.layer.definitionExpression,outFields:this._parentLayerView.layer.outFields,gdbVersion:this._parentLayerView.layer.gdbVersion,historicMoment:this._parentLayerView.layer.historicMoment&&this._parentLayerView.layer.historicMoment.getTime()}},t.prototype.acquireTile=function(e){var t=this,i=[0,0,0,0];this._tileInfoView.getTileBounds(i,e);var r=new V(e,i);return r.once("attach",function(){t._parentLayerView.requestUpdate()}),r},t.prototype.releaseTile=function(e){this.removeChild(e),e.once("detach",function(){e.dispose()})},t.prototype.setTileVisuals=function(e,t,i){var r=null;t&&!i&&(r=u.deserialize(t)),e.setData(r,null!=this._parentLayerView.layer.renderer.visualVariables,i),e.buildHLList(this._highlightIDs),this.addChild(e),this.requestRender()},t.prototype.patchTileVisuals=function(e,t){var i=t.addOrUpdate?u.deserialize(t.addOrUpdate):null;e.patchData({remove:t.remove||[],addOrUpdate:i}),e.buildHLList(this._highlightIDs),this.requestRender()},t.prototype.renderInit=function(){this._renderer=this._parentLayerView.layer.renderer,this._renderer.requiredFields&&this._renderer.requiredFields.sort();var e=this._parentLayerView.layer,t=g.getNormalizedRenderer(e.renderer,e.spatialReference,{fields:e.fields.map(function(e){return e.toJSON()})});this._visualVariablesInfo=m.convertVisualVariables(t.visualVariables),this.requestRender()},t.prototype.renderSwitchFrom=function(e){var t=this._parentLayerView.layer.renderer;t.requiredFields&&t.requiredFields.sort();var i=this._renderer,r=h.diff(i,t);if(!r)return!1;if("complete"===r.type)return this.renderInit(),!0;if("partial"===r.type){if(C(r))return this.renderInit(),!0;if(r.diff.visualVariables){var n=this._parentLayerView.layer,a=g.getNormalizedRenderer(t,n.spatialReference,{fields:n.fields.map(function(e){return e.toJSON()})}),o=m.convertVisualVariables(a.visualVariables),s=o.vvFields,l=o.vvRanges;return h.diff(this._visualVariablesInfo.vvFields,s)?(this.renderInit(),!0):(this._visualVariablesInfo.vvRanges=l,this._renderer=t,this.requestRender(),!1)}}},t.prototype.supports=function(e){return _.isRendererWebGLCompatible(e)},t}(d)});