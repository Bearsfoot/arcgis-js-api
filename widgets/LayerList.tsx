/**
 * The LayerList widget provides a way to display a list of layers, and switch on/off their visibility.
 * The {@link module:esri/widgets/LayerList/ListItem} API provides access to each layer's properties, allows
 * the developer to configure actions related to the layer, and allows the developer to add content to the item related to the layer.
 *
 * To hide layers in the map from the LayerList widget, you must set the
 * {@link module:esri/layers/Layer#listMode listMode} property on the desired layers to `hide`.
 *
 * @module esri/widgets/LayerList
 * @since 4.2
 *
 * @see [LayerList.tsx (widget view)]({{ JSAPI_ARCGIS_JS_API_URL }}/widgets/LayerList.tsx)
 * @see [LayerList.scss]({{ JSAPI_ARCGIS_JS_API_URL }}/themes/base/widgets/_LayerList.scss)
 * @see [Sample - LayerList widget](../sample-code/widgets-layerlist/index.html)
 * @see [Sample - LayerList widget with actions](../sample-code/widgets-layerlist-actions/index.html)
 * @see module:esri/widgets/LayerList/LayerListViewModel
 *
 * @example
 * var layerList = new LayerList({
 *   view: view
 * });
 * // Adds widget below other elements in the top left corner of the view
 * view.ui.add(layerList, {
 *   position: "top-left"
 * });
 */

/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
/// <amd-dependency path="esri/core/tsSupport/assignHelper" name="__assign" />

// dojo
import * as i18nCommon from "dojo/i18n!esri/nls/common";
import * as i18n from "dojo/i18n!esri/widgets/LayerList/nls/LayerList";

// esri.core
import Collection = require("esri/core/Collection");
import { deprecatedProperty } from "esri/core/deprecate";
import { eventKey } from "esri/core/events";
import Handles = require("esri/core/Handles");
import has = require("esri/core/has");
import Logger = require("esri/core/Logger");
import * as watchUtils from "esri/core/watchUtils";

// esri.core.accessorSupport
import { aliasOf, cast, declared, property, subclass } from "esri/core/accessorSupport/decorators";

// esri.layers
import Layer = require("esri/layers/Layer");

// esri.libs.sortablejs
import Sortable = require("esri/libs/sortablejs/Sortable");

// esri.support.actions
import ActionButton = require("esri/support/actions/ActionButton");
import ActionToggle = require("esri/support/actions/ActionToggle");

// esri.views
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");

// esri.widgets
import Widget = require("esri/widgets/Widget");

// esri.widgets.LayerList
import { Action, Actions, ListItemModifier, Sections } from "esri/widgets/LayerList/interfaces";
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");
import ListItem = require("esri/widgets/LayerList/ListItem");
import ListItemPanel = require("esri/widgets/LayerList/ListItemPanel");

// esri.widgets.support
import { VNode } from "esri/widgets/support/interfaces";
import { accessibleHandler, renderable, tsx, vmEvent } from "esri/widgets/support/widget";

function moveItem(data: any[], from: number, to: number): void {
  data.splice(to, 0, data.splice(from, 1)[0]);
}

const NEW_UI_FLAG = "esri-layerlist-new-ui";

const ListItemCollection = Collection.ofType<ListItem>(ListItem);

const SORT_GROUP_NAME = "root-layers";
const SORT_DATA_ATTR = "data-layer-uid";
const SORT_DATASET_ID = "layerUid";

const CSS = {
  // layerlist classes
  base: "esri-layer-list esri-widget esri-widget--panel",
  newUI: "esri-layer-list--new-ui",
  noItems: "esri-layer-list__no-items",
  list: "esri-layer-list__list",
  listRoot: "esri-layer-list__list--root",
  listExclusive: "esri-layer-list__list--exclusive",
  listInherited: "esri-layer-list__list--inherited",
  listIndependent: "esri-layer-list__list--independent",
  item: "esri-layer-list__item",
  itemContent: "esri-layer-list__item-content",
  itemError: "esri-layer-list__item--error",
  itemInvisible: "esri-layer-list__item--invisible",
  itemInvisibleAtScale: "esri-layer-list__item--invisible-at-scale",
  itemUpdating: "esri-layer-list__item--updating",
  itemChildren: "esri-layer-list__item--has-children",
  itemSelectable: "esri-layer-list__item--selectable",
  itemContainer: "esri-layer-list__item-container",
  actionsMenu: "esri-layer-list__item-actions-menu",
  actionsMenuItem: "esri-layer-list__item-actions-menu-item",
  actionsMenuItemActive: "esri-layer-list__item-actions-menu-item--active",
  actions: "esri-layer-list__item-actions",
  actionsList: "esri-layer-list__item-actions-list",
  action: "esri-layer-list__item-action",
  actionIcon: "esri-layer-list__item-action-icon",
  actionImage: "esri-layer-list__item-action-image",
  actionTitle: "esri-layer-list__item-action-title",
  actionToggle: "esri-layer-list__action-toggle",
  actionToggleOn: "esri-layer-list__action-toggle--on",
  label: "esri-layer-list__item-label",
  errorMessage: "esri-layer-list__item-error-message",
  title: "esri-layer-list__item-title",
  toggleVisible: "esri-layer-list__item-toggle",
  toggleVisibleIcon: "esri-layer-list__item-toggle-icon",
  toggleIcon: "esri-layer-list__item-toggle-icon",
  radioIcon: "esri-layer-list__item-radio-icon",
  childToggle: "esri-layer-list__child-toggle",
  childToggleOpen: "esri-layer-list__child-toggle--open",
  childOpened: "esri-layer-list__child-toggle-icon--opened",
  childClosed: "esri-layer-list__child-toggle-icon--closed",
  childClosed_RTL: "esri-layer-list__child-toggle-icon--closed-rtl",

  // common
  disabled: "esri-disabled",
  disabledElement: "esri-disabled-element",
  hidden: "esri-hidden",
  rotating: "esri-rotating",

  // icon classes
  iconEllipses: "esri-icon-handle-horizontal",
  iconVisible: "esri-icon-visible",
  iconInvisible: "esri-icon-non-visible",
  iconRadioSelected: "esri-icon-radio-checked",
  iconRadioUnselected: "esri-icon-radio-unchecked",
  iconNoticeTriangle: "esri-icon-notice-triangle",
  iconChildrenOpen: "esri-icon-down-arrow",
  iconDownArrow: "esri-icon-down-arrow",
  iconRightArrow: "esri-icon-right-triangle-arrow",
  iconLeftArrow: "esri-icon-left-triangle-arrow",
  iconLoading: "esri-icon-loading-indicator",
  iconDefaultAction: "esri-icon-default-action",
  widgetIcon: "esri-icon-layers"
};

const REGISTRY_KEYS = {
  actions: "actions",
  actionSection: "action-section",
  items: "items"
};

const VISIBILITY_MODES = {
  exclusive: "exclusive",
  inherited: "inherited",
  independent: "independent"
};

function closeItemActions(item: ListItem): void {
  const { actionsOpen, children } = item;

  if (actionsOpen) {
    item.actionsOpen = false;
  }

  children.forEach((child) => closeItemActions(child));
}

/**
 * Fires after the user clicks on an {@link module:esri/support/actions/ActionButton action} or {@link module:esri/support/actions/ActionToggle action toggle} inside the LayerList widget.
 * This event may be used to define a custom function to execute when particular
 * actions are clicked.
 *
 * @event module:esri/widgets/LayerList#trigger-action
 * @property {module:esri/support/actions/ActionButton | module:esri/support/actions/ActionToggle} action - The action clicked by the user.
 * @property {module:esri/widgets/LayerList/ListItem} item - An item associated with the action.
 */
const logger = Logger.getLogger("esri.widgets.LayerList");

interface VisibleElements {
  statusIndicators?: boolean;
}

const DEFAULT_VISIBLE_ELEMENTS: VisibleElements = {
  statusIndicators: true
};

@subclass("esri.widgets.LayerList")
class LayerList extends declared(Widget) {
  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  /**
   * @extends module:esri/widgets/Widget
   * @constructor
   * @alias module:esri/widgets/LayerList
   * @param {Object} [properties] - See the [properties](#properties-summary) for a list of all the properties
   *                                that may be passed into the constructor.
   *
   * @example
   * // typical usage
   * var layerlist = new LayerList({
   *   view: view
   * });
   */
  constructor(params?: any) {
    super(params);
  }

  postInitialize(): void {
    const operationalItems = this.operationalItems;

    this.own(
      watchUtils.on(this, "operationalItems", "change", () => this._itemsChanged(operationalItems)),
      watchUtils.init(this, "selectionEnabled", () => this._toggleSorting())
    );
  }

  destroy(): void {
    this._destroySortable();
    this._handles.destroy();
    this._handles = null;
  }

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------

  private _handles: Handles = new Handles();

  private _sortable: Sortable = null;

  private _sortableNode: HTMLUListElement = null;

  private _focusSortUid: string = null;

  private _newUI = has(NEW_UI_FLAG);

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  iconClass
  //----------------------------------

  /**
   * The widget's default CSS icon class.
   *
   * @since 4.7
   * @name iconClass
   * @instance
   * @type {string}
   */
  @property()
  iconClass = CSS.widgetIcon;

  //----------------------------------
  //  errorsVisible
  //----------------------------------

  /**
   *
   * @type {boolean}
   * @default false
   * @ignore
   */
  @property()
  @renderable()
  errorsVisible: false;

  //----------------------------------
  //  label
  //----------------------------------

  /**
   * The widget's default label.
   *
   * @since 4.7
   * @name label
   * @instance
   * @type {string}
   */
  @property()
  label: string = i18n.widgetLabel;

  //----------------------------------
  //  listItemCreatedFunction
  //----------------------------------

  /**
   * Function definition for the [listItemCreatedFunction](#listItemCreatedFunction) property.
   * See the example snippet in the  [listItemCreatedFunction](#listItemCreatedFunction)
   * documentation for more details.
   *
   * @callback module:esri/widgets/LayerList~ListItemCreatedHandler
   * @param {Object} event - An object containing a list item created by the LayerList.
   * @param {module:esri/widgets/LayerList/ListItem} event.item - A list item
   *   created by the LayerList. You can modify the properties of this item to customize
   *   the text, actions, panel content, and visibility of the list item. See the
   *   documentation for the [listItemCreatedFunction](#listItemCreatedFunction) for more details.
   */

  /**
   * Specifies a function that accesses each {@link module:esri/widgets/LayerList/ListItem}.
   * Each list item can be modified
   * according to its modifiable properties. Actions can be added to list items
   * using the {@link module:esri/widgets/LayerList/ListItem#actionsSections actionsSections}
   * property of the ListItem.
   *
   * @since 4.4
   *
   * @name listItemCreatedFunction
   * @instance
   * @type {module:esri/widgets/LayerList~ListItemCreatedHandler}
   * @see [Sample - LayerList widget with actions](../sample-code/widgets-layerlist-actions/index.html)
   *
   * @example
   * var layerList = new LayerList({
   *   view: view,
   *   // executes for each ListItem in the LayerList
   *   listItemCreatedFunction: function (event) {
   *
   *     // The event object contains properties of the
   *     // layer in the LayerList widget.
   *
   *     var item = event.item;
   *
   *     if (item.title === "US Demographics") {
   *       // open the list item in the LayerList
   *       item.open = true;
   *       // change the title to something more descriptive
   *       item.title = "Population by county";
   *       // set an action for zooming to the full extent of the layer
   *       item.actionsSections = [[{
   *         title: "Go to full extent",
   *         className: "esri-icon-zoom-out-fixed",
   *         id: "full-extent"
   *       }]];
   *     }
   *   }
   * });
   */
  @aliasOf("viewModel.listItemCreatedFunction")
  @renderable()
  listItemCreatedFunction: ListItemModifier = null;

  //----------------------------------
  //  multipleSelectionEnabled
  //----------------------------------

  /**
   * Indicates whether more than one list item may be selected by the user at a single time.
   * You must first set [selectionEnabled](#selectionEnabled) to `true` for this property
   * to have an effect on the widget.
   *
   * Selected items are available in the [selectedItems](#selectedItems)
   * property.
   *
   * @name multipleSelectionEnabled
   * @instance
   * @type {boolean}
   * @default false
   *
   * @see [selectionEnabled](#selectionEnabled)
   * @see [selectedItems](#selectedItems)
   *
   * @example
   * layerList.selectionEnabled = true;
   * layerList.multipleSelectionEnabled = true;
   */
  @property()
  multipleSelectionEnabled = false;

  //----------------------------------
  //  operationalItems
  //----------------------------------

  /**
   * A collection of {@link module:esri/widgets/LayerList/ListItem}s representing operational layers.
   * To hide layers from the LayerList widget, set the
   * {@link module:esri/layers/Layer#listMode listMode} property on the layer(s) to `hide`.
   *
   * @name operationalItems
   * @instance
   * @type {module:esri/core/Collection<module:esri/widgets/LayerList/ListItem>}
   * @readonly
   *
   * @see {@link module:esri/layers/Layer#listMode Layer.listMode}
   */
  @aliasOf("viewModel.operationalItems")
  @renderable()
  operationalItems: Collection<ListItem> = null;

  //----------------------------------
  //  selectionEnabled
  //----------------------------------

  /**
   * Indicates whether list items may be selected by the user. Selected items
   * may be reordered in the list by dragging gestures with the
   * mouse or touch screen, or with arrow keys on the keyboard.
   *
   * Selected items are available in the [selectedItems](#selectedItems)
   * property.
   *
   * @name selectionEnabled
   * @instance
   * @type {boolean}
   * @default false
   *
   * @see [selectedItems](#selectedItems)
   *
   * @example
   * layerList.selectionEnabled = true;
   */
  @property()
  @renderable()
  selectionEnabled = false;

  //----------------------------------
  //  selectedItems
  //----------------------------------

  /**
   * A collection of selected {@link module:esri/widgets/LayerList/ListItem}s representing operational layers
   * selected by the user.
   *
   * @name selectedItems
   * @instance
   * @type {module:esri/core/Collection<module:esri/widgets/LayerList/ListItem>}
   * @readonly
   *
   * @see [selectionEnabled](#selectionEnabled)
   */
  @property()
  @renderable()
  selectedItems: Collection<ListItem> = new ListItemCollection();

  //----------------------------------
  //  statusIndicatorsVisible
  //----------------------------------

  /**
   * Option for enabling status indicators, which indicate whether or not each layer
   * is loading resources.
   *
   * @name statusIndicatorsVisible
   * @instance
   *
   * @type {boolean}
   * @default true
   * @since 4.5
   * @deprecated since version 4.15. Use {@link module:esri/widgets/LayerList#visibleElements LayerList.visibleElements.statusIndicators} instead.
   *
   * @example
   * // disable status indicators for all layers listed in LayerList
   * layerList.statusIndicatorsVisible = false;
   */
  @property()
  @renderable()
  set statusIndicatorsVisible(value: boolean) {
    deprecatedProperty(logger, "statusIndicatorsVisible", {
      replacement: "visibleElements.statusIndicators",
      version: "4.15"
    });
    this.visibleElements = { ...this.visibleElements, statusIndicators: value };
  }

  //----------------------------------
  //  view
  //----------------------------------

  /**
   * A reference to the {@link module:esri/views/MapView} or {@link module:esri/views/SceneView}. Set this to link the widget to a specific view.
   *
   * @name view
   * @instance
   * @type {module:esri/views/MapView | module:esri/views/SceneView}
   */
  @aliasOf("viewModel.view")
  @renderable()
  view: MapView | SceneView = null;

  //----------------------------------
  //  viewModel
  //----------------------------------

  /**
   * The view model for this widget. This is a class that contains all the logic
   * (properties and methods) that controls this widget's behavior. See the
   * {@link module:esri/widgets/LayerList/LayerListViewModel} class to access
   * all properties and methods on the widget.
   *
   * @name viewModel
   * @instance
   * @type {module:esri/widgets/LayerList/LayerListViewModel}
   * @default
   */
  @vmEvent("trigger-action")
  @property({
    type: LayerListViewModel
  })
  @renderable("viewModel.state")
  viewModel: LayerListViewModel = new LayerListViewModel();

  //----------------------------------
  //  visibleElements
  //----------------------------------

  /**
   * The visible elements that are displayed within the widget.
   * This provides the ability to turn individual elements of the widget's display on/off.
   *
   * @typedef module:esri/widgets/LayerList~VisibleElements
   *
   * @property {boolean} [statusIndicators] - Indicates whether to the status indicators will be displayed. Default is `true`.
   */

  /**
   * The visible elements that are displayed within the widget.
   * This property provides the ability to turn individual elements of the widget's display on/off.
   *
   * @name visibleElements
   * @instance
   * @type {module:esri/widgets/LayerList~VisibleElements}
   * @autocast
   *
   * @since 4.15
   *
   * @example
   * layerList.visibleElements = {
   *   statusIndicators: false
   * };
   */
  @property()
  @renderable()
  visibleElements: VisibleElements = { ...DEFAULT_VISIBLE_ELEMENTS };

  @cast("visibleElements")
  protected castVisibleElements(value: Partial<VisibleElements>): VisibleElements {
    return { ...DEFAULT_VISIBLE_ELEMENTS, ...value };
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Triggers the [trigger-action](#event-trigger-action) event and executes
   * the given {@link module:esri/support/actions/ActionButton action} or {@link module:esri/support/actions/ActionToggle action toggle}.
   *
   * @param {module:esri/support/actions/ActionButton | module:esri/support/actions/ActionToggle} - The action to execute.
   * @param {module:esri/widgets/LayerList/ListItem} - An item associated with the action.
   */
  @aliasOf("viewModel.triggerAction")
  triggerAction(action: Action, item: ListItem): void {
    this.viewModel.triggerAction(action, item);
  }

  render(): VNode {
    const items = this._getItems();
    const state = this.get("viewModel.state");

    const content =
      items.length === 0 ? (
        <div class={CSS.noItems}>{i18n.noItemsToDisplay}</div>
      ) : (
        <ul
          aria-label={i18n.widgetLabel}
          role={this.selectionEnabled ? "listbox" : undefined}
          afterCreate={this._sortNodeCreated}
          afterRemoved={this._destroySortable}
          data-node-ref="_sortableNode"
          bind={this}
          class={this.classes(CSS.list, CSS.listRoot, CSS.listIndependent)}
        >
          {items.map((item) => this._renderItem(item, null))}
        </ul>
      );

    const baseClasses = {
      [CSS.newUI]: this._newUI,
      [CSS.hidden]: state === "loading",
      [CSS.disabled]: state === "disabled"
    };

    return <div class={this.classes(CSS.base, baseClasses)}>{content}</div>;
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private _destroySortable(): void {
    const { _sortable } = this;
    _sortable && _sortable.destroy();
    this._sortable = null;
  }

  private _toggleSorting(): void {
    const { _sortable, _sortableNode, selectionEnabled } = this;

    if (!_sortableNode) {
      return;
    }

    if (_sortable) {
      _sortable.option("disabled", !selectionEnabled);
    } else {
      const itemSort = Sortable.create(_sortableNode, {
        dataIdAttr: SORT_DATA_ATTR,
        group: SORT_GROUP_NAME,
        fallbackTolerance: 4, // Note: some phones with very sensitive touch displays like the Samsung Galaxy S8 will fire unwanted touchmove events even when your finger is not moving, resulting in the sort not triggering. Only needed when the item can also be clicked/touched. #25015
        disabled: !selectionEnabled,
        onSort: () => this._sortLayersToItems(itemSort.toArray())
      });

      this._sortable = itemSort;
    }
  }

  private _sortNodeCreated(el: HTMLUListElement): void {
    this._sortableNode = el;
    this._toggleSorting();
  }

  private _sortLayersToItems(itemIds: string[]): void {
    const layers = this.get<Collection<Layer>>("view.map.layers");

    if (!layers) {
      return;
    }

    layers.sort((a: Layer, b: Layer) => {
      const aIndex = itemIds.indexOf(a.uid);
      const bIndex = itemIds.indexOf(b.uid);

      if (aIndex > bIndex) {
        return -1;
      }

      if (aIndex < bIndex) {
        return 1;
      }

      return 0;
    });
  }

  private _getItems(): ListItem[] {
    return this.operationalItems.toArray().filter((item) => this.errorsVisible || !item.error);
  }

  private _getSingleActionButton(item: ListItem): ActionButton {
    return item.actionsSections
      .reduce((item) => item)
      .filter((item) => item && item.type === "button")
      .getItemAt(0) as ActionButton;
  }

  private _renderItem(item: ListItem, parent: ListItem): VNode {
    const widgetId = this.id;
    const uid = `${widgetId}_${item.uid}`;
    const actionsUid = `${uid}_actions`;
    const listUid = `${uid}__list`;
    const titleKey = `${uid}__title`;

    const { _newUI } = this;

    const childrenLen = item.children.length;
    const hasError = !!item.error;
    const hasChildren = !!childrenLen && !hasError;
    const errorMessage = hasError ? i18n.layerError : "";

    const { visibilityMode } = item;

    const childItems = item.children && item.children.toArray();

    const { exclusive, inherited } = VISIBILITY_MODES;

    const childClasses = {
      [CSS.listExclusive]: visibilityMode === exclusive,
      [CSS.listInherited]: visibilityMode === inherited,
      [CSS.listIndependent]: visibilityMode !== inherited && visibilityMode !== exclusive
    };

    const itemClasses = {
      [CSS.itemChildren]: hasChildren,
      [CSS.itemError]: !!hasError,
      [CSS.itemUpdating]: item.updating && !parent && this.visibleElements.statusIndicators,
      [CSS.itemInvisible]: _newUI && !item.visible,
      [CSS.itemInvisibleAtScale]: !item.visibleAtCurrentScale,
      [CSS.itemSelectable]: this.selectionEnabled
    };

    const actionsCount = this._countActions(item.actionsSections);

    const { panel } = item;

    const contentNode = panel && panel.open ? panel.render() : null;

    const contentActionNode = panel && panel.visible ? this._renderPanelButton(panel) : null;

    const actionsMenuClasses = {
      [CSS.actionsMenuItemActive]: item.actionsOpen
    };

    const actionsMenuTitle = item.actionsOpen ? i18nCommon.close : i18nCommon.open;

    const singleAction = actionsCount === 1 && this._getSingleActionButton(item);
    const singleActionNode = singleAction
      ? this._renderAction({ item, action: singleAction, singleAction: true })
      : null;

    const actionsMenuIcon =
      !singleAction && actionsCount ? (
        <div
          key={`actions-menu-toggle`}
          data-item={item}
          bind={this}
          onclick={this._toggleActionsOpen}
          onkeydown={this._toggleActionsOpen}
          class={this.classes(CSS.actionsMenuItem, actionsMenuClasses)}
          tabindex="0"
          role="button"
          aria-controls={actionsUid}
          aria-label={actionsMenuTitle}
          title={actionsMenuTitle}
        >
          <span aria-hidden="true" class={CSS.iconEllipses} />
        </div>
      ) : null;

    const actionsMenu =
      actionsMenuIcon || contentActionNode || singleActionNode ? (
        <div key={`esri-layer-list__actions-menu`} class={CSS.actionsMenu}>
          {contentActionNode}
          {singleActionNode}
          {actionsMenuIcon}
        </div>
      ) : null;

    const actions = actionsCount
      ? this._renderActionsSections(item, item.actionsSections, actionsUid)
      : null;

    const children: VNode = hasChildren ? (
      <ul
        key={`esri-layer-list__list-items`}
        id={listUid}
        class={this.classes(CSS.list, childClasses)}
        aria-expanded={item.open ? "true" : "false"}
        role={visibilityMode === exclusive ? "radiogroup" : "group"}
        hidden={item.open ? null : true}
      >
        {childItems.map((childItem) => this._renderItem(childItem, item))}
      </ul>
    ) : null;

    const childToggleClasses = {
      [CSS.childToggleOpen]: item.open
    };

    const toggleChildrenTitle = item.open ? i18nCommon.collapse : i18nCommon.expand;

    const toggleChildren = hasChildren ? (
      <span
        onclick={this._toggleChildrenClick}
        onkeydown={this._toggleChildrenClick}
        data-item={item}
        key={`esri-layer-list__toggle-children`}
        class={this.classes(CSS.childToggle, childToggleClasses)}
        tabindex="0"
        role="button"
        aria-controls={listUid}
        aria-label={toggleChildrenTitle}
        title={toggleChildrenTitle}
      >
        <span aria-hidden="true" class={this.classes(CSS.childClosed, CSS.iconRightArrow)} />
        <span aria-hidden="true" class={this.classes(CSS.childOpened, CSS.iconDownArrow)} />
        <span aria-hidden="true" class={this.classes(CSS.childClosed_RTL, CSS.iconLeftArrow)} />
      </span>
    ) : null;

    const itemLabel = this._createLabelNode(item, parent, titleKey);

    const errorBlock = hasError ? (
      <div key={`esri-layer-list__error`} class={CSS.errorMessage} role="alert">
        <span>{errorMessage}</span>
      </div>
    ) : null;

    const isSelected = this.selectedItems.indexOf(item) > -1;

    const sortDataAttrValue = !parent ? item.get<string>("layer.uid") : null;
    const listItemProps = this.selectionEnabled
      ? {
          bind: this,
          onclick: this._toggleSelection,
          onkeydown: this._selectionKeydown,
          "data-item": item,
          tabIndex: 0,
          "aria-selected": isSelected ? "true" : "false",
          role: "option",
          "aria-labelledby": titleKey,
          [SORT_DATA_ATTR]: sortDataAttrValue
        }
      : {
          bind: undefined,
          onclick: undefined,
          onkeydown: undefined,
          "data-item": undefined,
          tabIndex: undefined,
          "aria-selected": undefined,
          role: undefined,
          "aria-labelledby": undefined,
          [SORT_DATA_ATTR]: undefined
        };

    return (
      <li
        key={item}
        bind={this}
        afterCreate={this._focusListItem}
        afterUpdate={this._focusListItem}
        class={this.classes(CSS.item, itemClasses)}
        aria-labelledby={titleKey}
        {...listItemProps}
      >
        <div key={`esri-layer-list__list-item-container`} class={CSS.itemContainer}>
          {toggleChildren}
          {itemLabel}
          {actionsMenu}
        </div>
        {errorBlock}
        {actions}
        {contentNode}
        {children}
      </li>
    );
  }

  private _focusListItem(element: HTMLElement): void {
    const { _focusSortUid } = this;

    if (!element || !_focusSortUid) {
      return;
    }

    const uid = element.dataset[SORT_DATASET_ID];

    if (uid === _focusSortUid) {
      element.focus();
      this._focusSortUid = null;
    }
  }

  private _createLabelNode(item: ListItem, parent: ListItem, titleKey: string): VNode {
    const { selectionEnabled, _newUI } = this;
    const { exclusive, inherited } = VISIBILITY_MODES;
    const parentVisibilityMode = parent && parent.visibilityMode;

    const toggleIconClasses = {
      [CSS.toggleVisibleIcon]: _newUI,
      [CSS.toggleIcon]: _newUI && parentVisibilityMode !== exclusive,
      [CSS.radioIcon]: _newUI && parentVisibilityMode === exclusive,
      [CSS.iconRadioSelected]: parentVisibilityMode === exclusive && item.visible,
      [CSS.iconRadioUnselected]: parentVisibilityMode === exclusive && !item.visible,
      [CSS.iconVisible]: parentVisibilityMode !== exclusive && !_newUI && item.visible,
      [CSS.iconInvisible]: parentVisibilityMode !== exclusive && (_newUI || !item.visible)
    };

    const toggleRole = parentVisibilityMode === exclusive ? "radio" : "switch";
    const title = item.title || i18n.untitledLayer;
    const label = !item.visibleAtCurrentScale ? `${title} (${i18n.layerInvisibleAtScale})` : title;
    const titleNode = (
      <span
        key="layer-title-container"
        id={titleKey}
        title={label}
        aria-label={label}
        class={CSS.title}
      >
        {title}
      </span>
    );

    const visibilityIconNode = <span class={this.classes(toggleIconClasses)} aria-hidden="true" />;

    const toggleProps = {
      bind: this,
      onclick: this._toggleVisibility,
      onkeydown: this._toggleVisibility,
      "data-item": item,
      "data-parent-visibility": parentVisibilityMode,
      tabIndex: 0,
      "aria-checked": item.visible ? "true" : "false",
      role: toggleRole,
      "aria-labelledby": titleKey
    };

    const noToggleProps: Object = {
      bind: undefined,
      onclick: undefined,
      onkeydown: undefined,
      "data-item": undefined,
      "data-parent-visibility": undefined,
      tabIndex: undefined,
      "aria-checked": undefined,
      role: undefined,
      "aria-labelledby": undefined
    };

    const iconProps = selectionEnabled ? toggleProps : noToggleProps;
    const labelProps = selectionEnabled ? noToggleProps : toggleProps;

    const toggleNode = (
      <span class={CSS.toggleVisible} {...iconProps}>
        {visibilityIconNode}
      </span>
    );

    const labelContentNodes = [toggleNode, titleNode];

    if (_newUI) {
      labelContentNodes.reverse();
    }

    const labelNode = (
      <div key={item} class={CSS.label} {...labelProps}>
        {labelContentNodes}
      </div>
    );

    const hasError = !!item.error;

    const errorIconNode = hasError ? (
      <span key="notice-triangle" aria-hidden="true" class={CSS.iconNoticeTriangle} />
    ) : null;

    return parentVisibilityMode === inherited || hasError ? (
      <div key={item} class={CSS.label}>
        {errorIconNode}
        {titleNode}
      </div>
    ) : (
      labelNode
    );
  }

  private _renderPanelButton(panel: ListItemPanel): VNode {
    const { className, open, title, image } = panel;

    const actionClass = !image && !className ? CSS.iconDefaultAction : className;

    const iconStyles = this._getIconImageStyles(panel);

    const buttonClasses = {
      [CSS.actionsMenuItemActive]: open
    };

    const iconClasses = {
      [CSS.actionImage]: !!iconStyles["background-image"]
    };

    if (actionClass) {
      iconClasses[actionClass] = !!actionClass;
    }

    return (
      <div
        key={panel}
        bind={this}
        data-panel={panel}
        onclick={this._triggerPanel}
        onkeydown={this._triggerPanel}
        class={this.classes(CSS.actionsMenuItem, buttonClasses)}
        role="button"
        tabindex="0"
        title={title}
        aria-label={title}
      >
        <span class={this.classes(iconClasses)} styles={iconStyles} />
      </div>
    );
  }

  private _watchActionSectionChanges(actionSection: Actions, itemId: string): void {
    const registryKey = REGISTRY_KEYS.actionSection + itemId;

    this._handles.add(actionSection.on("change", this.scheduleRender.bind(this)), registryKey);

    actionSection.forEach((action) => this._renderOnActionChanges(action, itemId));
  }

  private _renderOnActionChanges(action: Action, itemId: string): void {
    const registryKey = REGISTRY_KEYS.actions + itemId;

    if (action.type === "toggle") {
      this._handles.add(
        [
          watchUtils.init(action, ["className", "image", "id", "title", "visible", "value"], () =>
            this.scheduleRender()
          )
        ],
        registryKey
      );

      return;
    }

    if (action.type === "slider") {
      this._handles.add(
        [
          watchUtils.init(
            action,
            [
              "className",
              "id",
              "title",
              "visible",
              "value",
              "displayValueEnabled",
              "max",
              "min",
              "step"
            ],
            () => this.scheduleRender()
          )
        ],
        registryKey
      );
      return;
    }

    this._handles.add(
      [
        watchUtils.init(action, ["className", "image", "id", "title", "visible"], () =>
          this.scheduleRender()
        )
      ],
      registryKey
    );
  }

  private _renderOnItemChanges(item: ListItem): void {
    const itemId = item.uid;

    const registryKey = REGISTRY_KEYS.items + itemId;

    this._handles.add(
      [
        watchUtils.init(
          item,
          [
            "actionsOpen",
            "visible",
            "open",
            "updating",
            "title",
            "visibleAtCurrentScale",
            "error",
            "visibilityMode",
            "panel",
            "panel.title",
            "panel.content",
            "panel.className"
          ],
          () => this.scheduleRender()
        ),
        item.actionsSections.on("change", () => this.scheduleRender()),
        item.children.on("change", () => this.scheduleRender())
      ],
      registryKey
    );

    item.children.forEach((child) => this._renderOnItemChanges(child));
    item.actionsSections.forEach((actionSection) =>
      this._watchActionSectionChanges(actionSection, itemId)
    );
  }

  private _itemsChanged(items: Collection<ListItem>): void {
    this._handles.removeAll();

    items.forEach((item) => this._renderOnItemChanges(item));

    this.scheduleRender();
  }

  private _renderActionsSections(
    item: ListItem,
    actionsSections: Sections,
    actionsUid: string
  ): VNode {
    const actionSectionsArray = actionsSections.toArray();

    const actionSection = actionSectionsArray.map((actionSection) => (
      <ul key={actionSection} class={CSS.actionsList}>
        {this._renderActionSection(item, actionSection)}
      </ul>
    ));

    return (
      <div
        role="group"
        aria-expanded={item.actionsOpen ? "true" : "false"}
        key={`esri-layer-list__actions-section`}
        id={actionsUid}
        class={CSS.actions}
        hidden={item.actionsOpen ? null : true}
      >
        {actionSection}
      </div>
    );
  }

  private _renderActionSection(item: ListItem, actionSection: Actions): VNode {
    const actionSectionArray = actionSection && actionSection.toArray();
    return actionSectionArray.map((action) => this._renderAction({ item, action }));
  }

  private _renderAction(options: {
    item: ListItem;
    action: Action;
    singleAction?: boolean;
  }): VNode {
    const { item, action, singleAction } = options;
    const iconStyles = this._getIconImageStyles(action);

    const { active, className, disabled, title } = action;

    const actionClass =
      action.type === "button" && !action.image && !className ? CSS.iconDefaultAction : className;

    const buttonClasses = {
      [CSS.actionsMenuItem]: singleAction && action.type === "button",
      [CSS.action]: !singleAction && action.type !== "toggle",
      [CSS.actionToggle]: action.type === "toggle",
      [CSS.actionToggleOn]: action.type === "toggle" && action.value,
      [CSS.disabledElement]: disabled
    };

    const iconClasses = {
      [CSS.actionImage]: !active && !!iconStyles["background-image"],
      [CSS.iconLoading]: active,
      [CSS.rotating]: active
    };

    if (actionClass) {
      iconClasses[actionClass] = true;
    }

    const iconNode = (
      <span
        key="action-icon"
        aria-hidden="true"
        class={this.classes(CSS.actionIcon, iconClasses)}
        styles={iconStyles}
      />
    );

    const titleNode = !singleAction ? (
      <span key="action-title" class={CSS.actionTitle}>
        {title}
      </span>
    ) : null;

    const actionContentNodes = [iconNode, titleNode];

    if (singleAction) {
      return (
        <div
          bind={this}
          data-item={item}
          data-action={action}
          role="button"
          key={action}
          onclick={this._triggerAction}
          onkeydown={this._triggerAction}
          classes={buttonClasses}
          tabindex="0"
          title={title}
          aria-label={title}
        >
          {actionContentNodes}
        </div>
      );
    }

    return (
      <li
        bind={this}
        data-item={item}
        data-action={action}
        key={action}
        onclick={this._triggerAction}
        onkeydown={this._triggerAction}
        classes={buttonClasses}
        tabindex="0"
        role="button"
        title={title}
        aria-label={title}
      >
        {actionContentNodes}
      </li>
    );
  }

  private _countActions(actionSections: Sections): number {
    return actionSections.reduce((count, section) => count + section.length, 0);
  }

  private _getIconImageStyles(source: Action | ListItemPanel): HashMap<string> {
    const image =
      source.declaredClass === "esri.widgets.LayerList.ListItemPanel" ||
      source.declaredClass === "esri.support.Action.ActionButton" ||
      source.declaredClass === "esri.support.Action.ActionToggle"
        ? (source as ActionButton | ActionToggle | ListItemPanel).image
        : null;

    return {
      "background-image": image ? `url("${image}")` : null
    };
  }

  private _selectionKeydown(event: KeyboardEvent): void {
    const SELECTION_KEYS = ["ArrowDown", "ArrowUp"];

    const key = eventKey(event);

    if (SELECTION_KEYS.indexOf(key) === -1) {
      this._toggleSelection(event);
      return;
    }

    event.stopPropagation();

    const node = event.currentTarget as Element;
    const item = node["data-item"];

    const { _sortable, selectedItems } = this;

    const isSelected = selectedItems.indexOf(item) > -1;
    const items = _sortable.toArray();
    const target = event.target as HTMLElement;
    const index = items.indexOf(target.dataset[SORT_DATASET_ID]);

    if (index === -1) {
      return;
    }

    if (key === "ArrowDown") {
      const newIndex = index + 1;

      if (newIndex >= items.length) {
        return;
      }

      if (isSelected) {
        moveItem(items, index, newIndex);
        _sortable.sort(items);
        this._sortLayersToItems(_sortable.toArray());
        this._focusSortUid = items[newIndex];
      } else {
        this._focusSortUid = items[newIndex];
        this.scheduleRender();
      }
    }

    if (key === "ArrowUp") {
      const newIndex = index - 1;

      if (newIndex <= -1) {
        return;
      }

      if (isSelected) {
        moveItem(items, index, newIndex);
        _sortable.sort(items);
        this._sortLayersToItems(_sortable.toArray());
        this._focusSortUid = items[newIndex];
      } else {
        this._focusSortUid = items[newIndex];
        this.scheduleRender();
      }
    }
  }

  @accessibleHandler()
  private _toggleActionsOpen(event: Event): void {
    const node = event.currentTarget as Element;
    const item = node["data-item"];
    const { actionsOpen } = item;
    const toggledValue = !actionsOpen;

    if (toggledValue) {
      this.operationalItems.forEach((item) => closeItemActions(item));
    }

    item.actionsOpen = toggledValue;
    event.stopPropagation();
  }

  @accessibleHandler()
  private _triggerPanel(event: Event): void {
    const node = event.currentTarget as Element;
    const panel = node["data-panel"] as ListItemPanel;

    if (panel) {
      panel.open = !panel.open;
    }

    event.stopPropagation();
  }

  @accessibleHandler()
  private _triggerAction(event: Event): void {
    const node = event.currentTarget as Element;
    const action = node["data-action"] as Action;
    const item = node["data-item"] as ListItem;

    if (action.type === "toggle") {
      action.value = !action.value;
    }

    this.triggerAction(action, item);
    event.stopPropagation();
  }

  @accessibleHandler()
  private _toggleVisibility(event: Event): void {
    const node = event.currentTarget as Element;
    const parentVisibilityMode = node.getAttribute("data-parent-visibility");
    const item = node["data-item"];
    if (!(parentVisibilityMode === VISIBILITY_MODES.exclusive && item.visible)) {
      item.visible = !item.visible;
    }
    event.stopPropagation();
  }

  @accessibleHandler()
  private _toggleChildrenClick(event: Event): void {
    const node = event.currentTarget as Element;
    const item = node["data-item"];
    item.open = !item.open;
    event.stopPropagation();
  }

  @accessibleHandler()
  private _toggleSelection(event: MouseEvent | KeyboardEvent): void {
    event.stopPropagation();
    const { multipleSelectionEnabled, selectedItems } = this;

    const allowMultipleSelected = multipleSelectionEnabled && (event.metaKey || event.ctrlKey);
    const node = event.currentTarget as Element;
    const item = node["data-item"] as ListItem;
    const found = selectedItems.indexOf(item) > -1;

    const { length } = selectedItems;
    const singleMatch = found && length === 1;

    if (allowMultipleSelected) {
      found ? selectedItems.remove(item) : selectedItems.add(item);
      return;
    }

    if (length && !singleMatch) {
      selectedItems.removeAll();
      selectedItems.add(item);
      return;
    }

    found ? selectedItems.remove(item) : selectedItems.add(item);
  }
}

export = LayerList;
