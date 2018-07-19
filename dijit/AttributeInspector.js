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
// See http://js.arcgis.com/3.25/esri/copyright.txt for details.

define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/_base/connect","dojo/_base/sniff","dojo/_base/kernel","dojo/has","dojo/dom-style","dojo/dom-construct","../kernel","../lang","../domUtils","../layers/InheritedDomain","../layers/FeatureLayer","dojo/i18n!../nls/jsapi","dojo/fx","dojox/gfx","dijit/_Widget","dijit/_Templated","dijit/Editor","dijit/_editor/plugins/LinkDialog","dijit/_editor/plugins/TextColor","./_EventedWidget","./editing/AttachmentEditor","./editing/Util","../tasks/query","dijit/form/DateTextBox","dijit/form/TextBox","dijit/form/NumberTextBox","dijit/form/FilteringSelect","dijit/form/NumberSpinner","dijit/form/Button","dijit/form/SimpleTextarea","dijit/form/ValidationTextBox","dijit/form/TimeTextBox","dijit/Tooltip","dojo/data/ItemFileReadStore","dojox/date/islamic","dojox/date/islamic/Date","dojox/date/islamic/locale","dojo/text!./templates/AttributeInspector.html"],function(e,t,i,n,s,a,r,l,o,d,u,h,c,f,_,m,F,I,p,y,g,T,b,v,L,E,x,j,N,D,C,S,V,w,A,O,R,k,P,B,U){var q=e([b,I,p],{declaredClass:"esri.dijit.AttributeInspector",widgetsInTemplate:!0,templateString:U,onUpdate:function(){},onDelete:function(){},onAttributeChange:function(){},onNext:function(){},onReset:function(){},onCancel:function(){},_navMessage:"( ${idx} ${of} ${numFeatures} )",_currentAttributeFieldName:null,_aiConnects:[],_selection:[],_toolTips:[],_numFeatures:0,_featureIdx:0,_currentLInfo:null,_currentFeature:null,_rollbackInfo:null,_eventMap:{update:!0,delete:["feature"],"attribute-change":["feature","fieldName","fieldValue"],next:["feature"],reset:!0,cancel:!0},_defaultRichTextPlugins:["bold","italic","underline","foreColor","hiliteColor","|","justifyLeft","justifyCenter","justifyRight","justifyFull","|","insertOrderedList","insertUnorderedList","indent","outdent","|","createLink"],css:{label:"atiLabel",field:"atiField",textArea:"atiTextAreaField",richText:"atiRichTextField",attachmentEditor:"atiAttachmentEditor",red:"atiRequiredField"},constructor:function(e,n){t.mixin(this,_.widgets.attributeInspector),e=e||{},e.featureLayer||e.layerInfos||console.error("esri.AttributeInspector: please provide correct parameter in the constructor"),this._datePackage=this._getDatePackage(e),this._layerInfos=e.layerInfos||[{featureLayer:e.featureLayer,options:e.options||[]}],this._layerInfos=i.filter(this._layerInfos,function(e){return!e.disableAttributeUpdate}),this._hideNavButtons=e.hideNavButtons||!1},postCreate:function(){if(i.every(this._layerInfos,function(e){return e.featureLayer.loaded}))this._initLayerInfos(),this._createAttachmentEditor(),this.onFirstFeature();else{var e=this._layerInfos.length;i.forEach(this._layerInfos,function(t){var i=t.featureLayer;if(i.loaded)e--;else var s=n.connect(i,"onLoad",this,function(t){n.disconnect(s),s=null,--e||(this._initLayerInfos(),this._createAttachmentEditor(),this.onFirstFeature())})},this)}},destroy:function(){this._destroyAttributeTable(),i.forEach(this._aiConnects,n.disconnect),delete this._aiConnects,this._attachmentEditor&&(this._attachmentEditor.destroy(),delete this._attachmentEditor),delete this._layerInfos,this._selection=this._currentFeature=this._currentLInfo=this._attributes=this._layerInfos=null,this.inherited(arguments)},refresh:function(){this._updateSelection()},first:function(){this.onFirstFeature()},last:function(){this.onLastFeature()},next:function(){this.onNextFeature()},previous:function(){this.onPreviousFeature()},showFeature:function(e,t){t&&(this._createOnlyFirstTime=!0),this._updateSelection([e],t),this._updateUI()},onLayerSelectionChange:function(e,t,i){this._createOnlyFirstTime=!1,this._featureIdx=i===f.SELECTION_NEW?0:this._featureIdx,this._updateSelection(),this._updateUI()},onLayerSelectionClear:function(){!this._selection||this._selection.length<=0||(this._numFeatures=0,this._featureIdx=0,this._selection=[],this._currentFeature=null,this._currentLInfo=null,this._updateUI())},onLayerUpdateEnd:function(e,t,i,n){},onLayerError:function(e,t,i,n){},onLayerEditsError:function(e,t,i,n){},onLayerEditsComplete:function(e,n,s,a){if(a=a||[],a.length){var r=this._selection,l=e.featureLayer.objectIdField;i.forEach(a,t.hitch(this,function(e){i.some(r,t.hitch(this,function(t,i){return t.attributes[l]===e.objectId&&(this._selection.splice(i,1),!0)}))}))}n=n||[],n.length&&(this._selection=L.findFeatures(n,e.featureLayer),this._featureIdx=0),this._selection=L.sortFeaturesById(this._layerInfos,this._selection);var o=this._numFeatures=this._selection?this._selection.length:0;if(n.length){var d=o?this._selection[this._featureIdx]:null;if(d){var u=d.getLayer(),h=u.getEditCapabilities();h.canCreate&&!h.canUpdate||this._showFeature(d)}this._updateUI()}if(s=s||[],s.length){var c=this._rollbackInfo;i.forEach(s,function(t){var n=L.findFeatures(s,e.featureLayer)[0];if(!t.success&&n.attributes[e.featureLayer.objectIdField]===t.objectId&&c){var a=c.field,r=c.graphic,l=r.attributes[a.name],o=i.filter(this._currentLInfo.fieldInfos,function(e){return e.fieldName===a.name},this)[0],d=o.dijit;n.attributes[a.name]=l,"esriFieldTypeDate"===a.type&&(l=new Date(l)),this._setValue(d,l)}},this)}this._rollbackInfo=null},onFieldValueChange:function(e,t){var n,s=e.field,a=e.dijit,r=this._currentFeature,l=this._currentLInfo,o=s.name;if(""!==a.displayedValue&&"dijit.form.ValidationTextBox"===a.declaredClass&&!a.isValid())return void this._setValue(a,r.attributes[s.name]);if(""!==a.displayedValue&&a.displayedValue!==t&&a.isValid&&!a.isValid())return void this._setValue(a,r.attributes[s.name]);if(n=!("esriFieldTypeInteger"!==s.type&&"esriFieldTypeSmallInteger"!==s.type&&"esriFieldTypeSingle"!==s.type&&"esriFieldTypeDouble"!==s.type),t=""===t&&n||void 0===t?null:t,n&&null!==t&&(t=Number(t)),"esriFieldTypeDate"===s.type){if(a instanceof Array){var d=a[0].getValue(),u=a[1].getValue();t=d&&u?new Date(d.getFullYear(),d.getMonth(),d.getDate(),u.getHours(),u.getMinutes(),u.getSeconds(),u.getMilliseconds()):d||u||null}else t=a.getValue(),s.domain&&(t=Number(t));t=t&&t.getTime?t.getTime():t&&t.toGregorian?t.toGregorian().getTime():t}if(this._currentFeature.attributes[s.name]!==t){if(o===l.typeIdField){var h=this._findFirst(l.types,"id",t),c=l.fieldInfos;i.forEach(c,function(e){if((s=e.field)&&s.name!==l.typeIdField){var t=e.dijit;this._setFieldDomain(t,h,s)&&t&&(this._setValue(t,r.attributes[s.name]+""),!1===t.isValid()&&this._setValue(t,null))}},this)}this.onAttributeChange(r,o,t)}},onDeleteBtn:function(e){this._deleteFeature()},onNextFeature:function(e){this._onNextFeature(1)},onPreviousFeature:function(e){this._onNextFeature(-1)},onFirstFeature:function(e){this._onNextFeature(-1*this._featureIdx)},onLastFeature:function(e){this._onNextFeature(this._numFeatures-1-this._featureIdx)},_initLayerInfos:function(){var e=this._layerInfos;this._editorTrackingInfos={},i.forEach(e,this._initLayerInfo,this)},_initLayerInfo:function(e){var n,s,a=e.featureLayer;this._userIds={};var r=a.id;a.credential&&(this._userIds[r]=a.credential.userId),e.userId&&(this._userIds[r]=e.userId),this._connect(a,"onSelectionComplete",t.hitch(this,"onLayerSelectionChange",e)),this._connect(a,"onSelectionClear",t.hitch(this,"onLayerSelectionClear",e)),this._connect(a,"onEditsComplete",t.hitch(this,"onLayerEditsComplete",e)),this._connect(a,"error",t.hitch(this,"onLayerError",e)),this._connect(a,"onUpdateEnd",t.hitch(this,"onLayerUpdateEnd",e)),e.showAttachments=!!a.hasAttachments&&(!u.isDefined(e.showAttachments)||e.showAttachments),e.hideFields=e.hideFields||[],e.htmlFields=e.htmlFields||[],e.isEditable=!!a.isEditable()&&(!u.isDefined(e.isEditable)||e.isEditable),e.typeIdField=a.typeIdField,e.layerId=a.id,e.types=a.types,a.globalIdField&&((n=this._findFirst(e.fieldInfos,"fieldName",a.globalIdField))||e.showGlobalID||e.hideFields.push(a.globalIdField)),(s=this._findFirst(e.fieldInfos,"fieldName",a.objectIdField))||e.showObjectID||e.hideFields.push(a.objectIdField);var l=this._getFields(e.featureLayer);if(l){var o=e.fieldInfos||[];o=i.map(o,function(e){return t.mixin({},e)}),o.length?e.fieldInfos=i.filter(i.map(o,t.hitch(this,function(i){var n=i.stringFieldOption||(this._isInFields(i.fieldName,e.htmlFields)?q.STRING_FIELD_OPTION_RICHTEXT:q.STRING_FIELD_OPTION_TEXTBOX);return t.mixin(i,{field:this._findFirst(l,"name",i.fieldName),stringFieldOption:n})})),"return item.field;"):(l=i.filter(l,t.hitch(this,function(t){return!this._isInFields(t.name,e.hideFields)})),e.fieldInfos=i.map(l,t.hitch(this,function(t){var i=this._isInFields(t.name,e.htmlFields)?q.STRING_FIELD_OPTION_RICHTEXT:q.STRING_FIELD_OPTION_TEXTBOX;return{fieldName:t.name,field:t,stringFieldOption:i}}))),e.showGlobalID&&!n&&o.push(this._findFirst(l,"name",a.globalIdField)),e.showObjectID&&!s&&o.push(this._findFirst(l,"name",a.objectIdField));var d=[];a.editFieldsInfo&&(a.editFieldsInfo.creatorField&&d.push(a.editFieldsInfo.creatorField),a.editFieldsInfo.creationDateField&&d.push(a.editFieldsInfo.creationDateField),a.editFieldsInfo.editorField&&d.push(a.editFieldsInfo.editorField),a.editFieldsInfo.editDateField&&d.push(a.editFieldsInfo.editDateField)),this._editorTrackingInfos[a.id]=d}},_createAttachmentEditor:function(){this._attachmentEditor=null;var e=this._layerInfos,t=i.filter(e,function(e){return e.showAttachments});t&&t.length&&(this._attachmentEditor=new v({class:this.css.attachmentEditor},this.attachmentEditor),this._attachmentEditor.startup())},_setCurrentLInfo:function(e){var t=this._currentLInfo?this._currentLInfo.featureLayer:null,i=e.featureLayer;if(t&&t.id===i.id&&!t.ownershipBasedAccessControlForFeatures){var n=i.getEditCapabilities();if(!n.canCreate||n.canUpdate)return}this._currentLInfo=e,this._createTable()},_updateSelection:function(e,t){this._selection=e||[];var n=this._layerInfos;i.forEach(n,this._getSelection,this),this._selection=L.sortFeaturesById(this._layerInfos,this._selection),this._numFeatures=this._selection.length;var s=this._numFeatures?this._selection[this._featureIdx]:null;this._showFeature(s,t)},_getSelection:function(e){var t=e.featureLayer.getSelectedFeatures();this._selection=this._selection.concat(t)},_updateUI:function(){var e=this._numFeatures,t=this._currentLInfo;this.layerName.innerHTML=t&&0!==e?t.featureLayer?t.featureLayer.name:"":this.NLS_noFeaturesSelected,l.set(this.attributeTable,"display",e?"":"none"),l.set(this.editButtons,"display",e?"":"none"),l.set(this.navButtons,"display",!this._hideNavButtons&&e>1?"":"none"),this.navMessage.innerHTML=u.substitute({idx:this._featureIdx+1,of:this.NLS_of,numFeatures:this._numFeatures},this._navMessage),this._attachmentEditor&&l.set(this._attachmentEditor.domNode,"display",t&&t.showAttachments&&e?"":"none");var i=!(t&&!1===t.showDeleteButton||!this._canDelete);l.set(this.deleteBtn.domNode,"display",i?"":"none"),this.domNode.parentNode&&this.domNode.parentNode.scrollTop>0&&(this.domNode.parentNode.scrollTop=0)},_onNextFeature:function(e){this._featureIdx+=e,this._featureIdx<0?this._featureIdx=this._numFeatures-1:this._featureIdx>=this._numFeatures&&(this._featureIdx=0);var t=this._selection.length?this._selection[this._featureIdx]:null;this._showFeature(t),this._updateUI(),this.onNext(t)},_deleteFeature:function(){this.onDelete(this._currentFeature)},_showFeature:function(e,n){if(e){this._currentFeature=e;var s=n||e.getLayer(),a=s.getEditCapabilities({feature:e,userId:this._userIds[s.id]});this._canUpdate=a.canUpdate,this._canDelete=a.canDelete;var r=this._getLInfoFromFeatureLayer(s);if(r){this._setCurrentLInfo(r);var l=e.attributes,o=this._findFirst(r.types,"id",l[r.typeIdField]),d=null,c=r.fieldInfos;i.forEach(c,function(e){d=e.field;var n=[];e.dijit&&e.dijit.length>1?i.forEach(e.dijit,function(e){n.push(e)}):n.push(e.dijit),i.forEach(n,t.hitch(this,function(e){if(e){var t=this._setFieldDomain(e,o,d),i=l[d.name];i=i&&t&&t.codedValues&&t.codedValues.length&&t.codedValues[i]?t.codedValues[i].name:i,u.isDefined(i)||(i=""),"dijit.form.DateTextBox"===e.declaredClass||"dijit.form.TimeTextBox"===e.declaredClass?i=""===i?null:new Date(i):"dijit.form.FilteringSelect"===e.declaredClass&&(e._lastValueReported=null,i=l[d.name]+"");try{this._setValue(e,i),"dijit.form.FilteringSelect"===e.declaredClass&&!1===e.isValid()&&this._setValue(e,null)}catch(t){e.set("displayedValue",this.NLS_errorInvalid,!1)}}}))},this),this._attachmentEditor&&r.showAttachments&&this._attachmentEditor.showAttachments(this._currentFeature,s);var f=s.getEditSummary(e);f?(this.editorTrackingInfoDiv.innerHTML=f,h.show(this.editorTrackingInfoDiv)):h.hide(this.editorTrackingInfoDiv)}}},_setFieldDomain:function(e,t,n){if(!e)return null;var s=n.domain;return t&&t.domains&&t.domains[n.name]&&t.domains[n.name]instanceof c==!1&&(s=t.domains[n.name]),s?(s.codedValues&&s.codedValues.length>0?(e.set("store",this._toStore(i.map(s.codedValues,function(e){return{id:e.code+="",name:e.name}}))),this._setValue(e,s.codedValues[0].code)):(e.constraints={min:u.isDefined(s.minValue)?s.minValue:Number.MIN_VALUE,max:u.isDefined(s.maxValue)?s.maxValue:Number.MAX_VALUE},this._setValue(e,e.constraints.min)),s):null},_setValue:function(e,t){e.set&&(e._onChangeActive=!1,e.set("value",t,!0),e._onChangeActive=!0)},_getFields:function(e){var n=e._getOutFields();if(!n)return null;var s=e.fields;return"*"==n?s:i.filter(i.map(n,t.hitch(this,"_findFirst",s,"name")),u.isDefined)},_isInFields:function(e,t){return!(!e||!t&&!t.length)&&i.some(t,function(t){return t.toLowerCase()===e.toLowerCase()})},_isFieldNullable:function(e,t){return!(!1===e.nullable||t.field&&!1===t.field.nullable)},_isFieldRequired:function(e,t){return!1!==e.editable&&!1!==t.isEditable&&!this._isFieldNullable(e,t)},_findFirst:function(e,t,n){var s=i.filter(e,function(e){return e.hasOwnProperty(t)&&e[t]===n});return s&&s.length?s[0]:null},_getLInfoFromFeatureLayer:function(e){var t=e?e.id:null;return this._findFirst(this._layerInfos,"layerId",t)},_createTable:function(){this._destroyAttributeTable(),this.attributeTable.innerHTML="",this._attributes=o.create("table",{cellspacing:"0",cellpadding:"0"},this.attributeTable);var e=o.create("tbody",null,this._attributes),n=this._currentFeature,s=this._currentLInfo,a=this._findFirst(s.types,"id",n.attributes[s.typeIdField]),r=s.fieldInfos;i.forEach(r,t.hitch(this,"_createField",a,e),this),this._createOnlyFirstTime=!1},_createField:function(e,i,n){var s=this._currentLInfo,a=n.field;if(!this._isInFields(a.name,s.hideFields)&&!this._isInFields(a.name,this._editorTrackingInfos[s.featureLayer.id])){var r,l,d,u,h,c,f,_=!1;if(r=o.create("tr",null,i),l=o.create("td",{innerHTML:n.label||a.alias||a.name,class:this.css.label,"data-fieldname":a.name},r),this._isFieldRequired(a,n)&&o.create("span",{class:this.css.red,innerHTML:" *"},l),d=o.create("td",null,r),n.customField?(o.place(n.customField.domNode||n.customField,o.create("div",null,d),"first"),u=n.customField):!1!==s.isEditable&&!1!==a.editable&&!1!==n.isEditable&&"esriFieldTypeOID"!==a.type&&"esriFieldTypeGlobalID"!==a.type&&(this._canUpdate||this._createOnlyFirstTime)||(_=!0),c=s.typeIdField&&a.name.toLowerCase()==s.typeIdField.toLowerCase(),f=!!this._getDomainForField(a,e),!u&&c?u=this._createTypeField(a,n,d):!u&&f&&(u=this._createDomainField(a,n,e,d)),!u)switch(a.type){case"esriFieldTypeString":u=this._createStringField(a,n,d);break;case"esriFieldTypeDate":u=this._createDateField(a,n,d),n.format&&n.format.time&&(h=this._createTimeField(a,n,d));break;case"esriFieldTypeInteger":case"esriFieldTypeSmallInteger":u=this._createIntField(a,n,d);break;case"esriFieldTypeSingle":case"esriFieldTypeDouble":u=this._createFltField(a,n,d);break;default:u=this._createStringField(a,n,d)}n.tooltip&&n.tooltip.length&&this._toolTips.push(new O({connectId:[u.id],label:n.tooltip})),u.onChange=t.hitch(this,"onFieldValueChange",n),u.set("disabled",_),h?(n.dijit=[u,h],h.onChange=t.hitch(this,"onFieldValueChange",n),h.set("disabled",_)):n.dijit=u}},_createTypeField:function(e,t,n){var s=o.create("div",null,n),a=e.domain;return a&&"range"===a.type&&a.minValue===a.maxValue?new w({class:this.css.field,trim:!0,maxLength:e.length,name:e.alias||e.name,required:this._isFieldRequired(e,t)},s):new D({class:this.css.field,name:e.alias||e.name,required:this._isFieldRequired(e,t),store:this._toStore(i.map(this._currentLInfo.types,function(e){return{id:e.id,name:e.name}})),searchAttr:"name"},s)},_getDomainForField:function(e,t){var i=e.domain,n=e.name;return n&&t&&t.domains&&t.domains[n]&&t.domains[n]instanceof c==!1&&(i=t.domains[n]),i||null},_createDomainField:function(e,t,i,n){var s=this._getDomainForField(e,i),a=o.create("div",null,n);return s.codedValues?new D({class:this.css.field,name:e.alias||e.name,searchAttr:"name",required:this._isFieldRequired(e,t)},a):new C({class:this.css.field},a)},_createStringField:function(e,t,i){var n=o.create("div",null,i),s={trim:!0,maxLength:e.length,required:this._isFieldRequired(e,t)};if(t.stringFieldOption===q.STRING_FIELD_OPTION_TEXTAREA)return s.class=this.css.field+" "+this.css.textArea,new V(s,n);if(t.stringFieldOption===q.STRING_FIELD_OPTION_RICHTEXT){s.class=this.css.field+" "+this.css.richText,s.height="100%",s.width="100%",s.plugins=t.richTextPlugins||this._defaultRichTextPlugins;var a=new y(s,n);return a.startup(),a}var r=this;return s.validator=function(i,n){return this._maskValidSubsetError=!1,this._hasBeenBlurred=!0,r._isFieldNullable(e,t)||!(""===i||null===i)},new w(s,n)},_createTimeField:function(e,t,i){var n=o.create("div",null,i),s={class:this.css.field,trim:!0,required:this._isFieldRequired(e,t),constraints:{formatLength:"medium"}};return this._datePackage&&(s.datePackage=this._datePackage),new A(s,n)},_createDateField:function(e,t,i){var n=o.create("div",null,i),s={class:this.css.field,trim:!0,required:this._isFieldRequired(e,t)};return this._datePackage&&(s.datePackage=this._datePackage),new x(s,n)},_createIntField:function(e,t,i){var n,s=o.create("div",null,i);return n="esriFieldTypeSmallInteger"===e.type?{min:-32768,max:32767,places:0}:{places:0},new N({class:this.css.field,constraints:n,trim:!0,invalidMessage:this.NLS_validationInt,required:this._isFieldRequired(e,t)},s)},_createFltField:function(e,t,i){var n=o.create("div",null,i);return new N({class:this.css.field,constraints:{max:1/0,min:-1/0,places:"0,20"},trim:!0,invalidMessage:this.NLS_validationFlt,required:this._isFieldRequired(e,t)},n)},_toStore:function(e){return new R({data:{identifier:"id",label:"name",items:e}})},_connect:function(e,t,i){this._aiConnects.push(n.connect(e,t,i))},_getDatePackage:function(e){return null===e.datePackage?null:e.datePackage?e.datePackage:"ar"===a.locale?"dojox.date.islamic":null},_destroyAttributeTable:function(){var e=this._layerInfos;i.forEach(e,function(e){var n=e.fieldInfos;i.forEach(n,function(e){var n=e.dijit;if(n){if(n._onChangeHandle=null,e.customField)return;n instanceof Array?i.forEach(n,t.hitch(this,function(e){e.destroyRecursive?e.destroyRecursive():e.destroy&&e.destroy(),e._onChangeHandle=null})):n.destroyRecursive?n.destroyRecursive():n.destroy&&n.destroy()}e.dijit=null},this)},this);var n=this._toolTips;i.forEach(n,function(e){e.destroy()}),this._toolTips=[],this._attributes&&o.destroy(this._attributes)}});return t.mixin(q,{STRING_FIELD_OPTION_RICHTEXT:"richtext",STRING_FIELD_OPTION_TEXTAREA:"textarea",STRING_FIELD_OPTION_TEXTBOX:"textbox"}),r("extend-esri")&&t.setObject("dijit.AttributeInspector",q,d),q});