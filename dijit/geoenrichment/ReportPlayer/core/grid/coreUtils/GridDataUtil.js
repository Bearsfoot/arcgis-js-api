// COPYRIGHT © 201 Esri
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
// See http://js.arcgis.com/3.26/esri/copyright.txt for details.

define(["dojo/_base/lang","../../supportClasses/templateJsonUtils/fieldInfo/FieldLibrary"],function(e,i){var t={};return t.getFieldCellValue=function(e){return e.gridData&&e.gridData[e.column.field]},t.setFieldCellContent=function(e,i){e.set("value",i),e.gridData[e.column.field]=i},t.clearFieldInfo=function(e,i){e.fieldInfos&&delete e.fieldInfos[i],e[i]="",t.setNumericDataValue(void 0,e,i)},t.getNumericCellValue=function(e){return t.getNumericDataValue(e.gridData,e.column.field)},t.setNumericCellValue=function(e,i){return t.setNumericDataValue(i,e.gridData,e.column.field)},t.getNumericDataValue=function(e,i){return e&&i&&e[i+"_numeric"]},t.setNumericDataValue=function(e,i,t){i[t+"_numeric"]=e},t.isEmptyCell=function(e){return!e.get("value")&&!e.gridData[e.column.field]&&!t.getFieldInfo(e)},t.hasSpans=function(e){return t.getColumnSpan(e)||t.getRowSpan(e)},t.getColumnSpan=function(e){return e.gridData&&e.gridData.columnSpans&&e.gridData.columnSpans[e.column.field]},t.getRowSpan=function(e){return e.gridData&&e.gridData.rowSpans&&e.gridData.rowSpans[e.column.field]},t.getDataColumnSpan=function(e,i){return e&&e.columnSpans&&e.columnSpans[i]},t.getDataRowSpan=function(e,i){return e&&e.rowSpans&&e.rowSpans[i]},t.getFieldInfo=function(e){return e&&e.gridData&&e.gridData.fieldInfos&&e.gridData.fieldInfos[e.column.field]},t.getGridFirstFieldInfo=function(e){return t.getFieldInfo(e.getFirstCell())},t.setFieldInfo=function(e,i){e.gridData&&(e.gridData.fieldInfos[e.column.field]=i)},t.provideFieldInfo=function(e){return t.setFieldInfo(e,t.getFieldInfo(e)||{}),t.getFieldInfo(e)},t.getCellStyle=function(e,i){if(!e||!e.gridData)return null;var n=e.gridData.style&&e.gridData.style.fields&&e.gridData.style.fields[e.column.field];return!n&&i&&(n={},t.setCellStyle(e,n)),n},t.setCellStyle=function(e,i){var t=e.gridData.style=e.gridData.style||{};t.fields=t.fields||{},t.fields[e.column.field]=i},t.updateCellStyle=function(i,n){var l=t.getCellStyle(i,!0);e.mixin(l,n)},t.copyFieldStyle=function(e,i,n){var l=t.getCellStyle(e),r=t.getCellStyle(i,!0);for(var a in n)void 0!==l[a]&&(r[a]=l[a])},t.getFieldCellUrl=function(e){if(e.gridData&&e.gridData.urls&&e.column)return e.gridData.urls[e.column.field]},t.setFieldCellUrl=function(e,i){e.gridData&&e.column&&(e.gridData.urls=e.gridData.urls||{},void 0===i?delete e.gridData.urls[e.column.field]:e.gridData.urls[e.column.field]=i)},t.getConditionalFormatting=function(e){var i=t.getFieldInfo(e);return i&&i.triggerJson},t.setConditionalFormatting=function(i,n){var l=t.provideFieldInfo(i);n&&n.fieldInfo===l&&(n.fieldInfo=e.clone(n.fieldInfo),delete n.fieldInfo.triggerJson),l.triggerJson=n},t._toFieldInfo=function(e){return e?e.gridData?t.getFieldInfo(e):"object"==typeof e&&e:null},t.isRichTextCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.isRichText)},t.isVariableFieldCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.hasVariable&&!i.script)},t.isOnlyVariableFieldCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.hasVariable)},t.isScriptFieldCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.script)},t.isUneditableScript=function(e){var i=t._toFieldInfo(e);return!!(i&&i.script&&i.script.isUneditableScript)},t.isNumericVariableFieldCell=function(e){var i=t._toFieldInfo(e);return!(!i||!(i.hasVariable&&"esriFieldTypeString"!==i.type||i.script&&!i.script.isUneditableScript&&"String"!==i.script.type))},t.isStringVariableFieldCell=function(e){var i=t._toFieldInfo(e);return!(!i||!(i.hasVariable&&"esriFieldTypeString"===i.type||i.script&&"String"===i.script.type))},t.isImageCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.isImage)},t.isMapImageCell=function(e){var i=t._toFieldInfo(e);return!!(i&&i.isImage&&i.imageJson.isMapImage)},t.isImageTriggerCell=function(e){var i=t._toFieldInfo(e);return!!(i&&i.isImage&&i.triggerJson)},t.isShapeCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.isShape)},t.isEmptyShapeCell=function(e){var i=t._toFieldInfo(e),n=i&&i.shapeJson;return!(!n||n.g&&n.g.length)},t.isReportSectionCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.isReportSection)},t.isInfographicCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.isInfographic)},t.isChartCell=function(e){var i=t._toFieldInfo(e);return!(!i||!i.isChart)},t.isSpecialFieldCell=function(e){var n=t._toFieldInfo(e);return n&&!t.isVariableFieldCell(e)&&i.hasField(n.name)},t.isTextLikeCell=function(e){return!t._toFieldInfo(e)||t.isRichTextCell(e)||t.isVariableFieldCell(e)||t.isSpecialFieldCell(e)},t});