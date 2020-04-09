// COPYRIGHT © 2020 Esri
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
// See http://js.arcgis.com/4.15/esri/copyright.txt for details.

define(["require","exports","dojo/_base/kernel","./core/has","./core/promiseUtils","./support/revision"],(function(e,r,n,s,o,t){var i,a,u,c;Object.defineProperty(r,"__esModule",{value:!0}),r.revision=t.commitHash,i=n.config,a=void 0!==i.useDeferredInstrumentation,u=i.has&&void 0!==i.has["config-deferredInstrumentation"],c=i.has&&void 0!==i.has["config-useDeferredInstrumentation"],a||u||c||(s.add("config-deferredInstrumentation",!1,!0,!0),s.add("config-useDeferredInstrumentation",!1,!0,!0)),r.version="4.15",r.workerMessages={request:function(r){return o.create((function(r){e(["./request"],r)})).then((function(e){var n=r.options||{};return n.responseType="array-buffer",e(r.url,n)})).then((function(e){return{result:{data:e.data,ssl:e.ssl},transferList:[e.data]}}))}},r.setId=function(e){r.id=e},!s("host-webworker")&&s("esri-console-log-version")&&(s("esri-next")?console.warn("Using ArcGIS API for JavaScript "+r.version+"-next [Date: "+t.buildDate+", Revision: "+t.commitHash.slice(0,8)+"]"):console.debug("Using ArcGIS API for JavaScript "+r.version+" [Date: "+t.buildDate+", Revision: "+t.commitHash.slice(0,8)+"]"))}));