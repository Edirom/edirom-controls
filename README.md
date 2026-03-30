This repository is work in progress and highly experimental at the moment.

This repository collects web components that are used to control views in the Edirom. It consists of:

- `edirom-control-bar` — a wrapper web component for different constellations of control elements.
- different control elements in the form of small web components:
  - `edirom-button-widget` — a square icon button widget for use inside a control bar.
  - `edirom-spacer-widget` — a layout helper that fills available space between control widgets.

---

## `edirom-button-widget`

A square icon button for use inside an `edirom-control-bar`. It renders an `edirom-icon` (from `edirom-core-web-components`) centred inside a rounded container. The element maintains a 1:1 aspect ratio and fills the full height of its parent.

The button operates as a **state carousel**: it holds a list of named states (each with an associated icon), displays the icon of the current state, and on each click dispatches a request for the *next* state without advancing itself. The calling application is responsible for setting the new `current-state` attribute in response to that event.

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `states-data` | JSON string (array) | `'[]'` | Stringified array of state objects. Each object must have a `name` (string) and an `iconName` (string) key. The array order defines the carousel sequence. |
| `current-state` | string | — | The `name` of the active state. When set, the button renders the corresponding icon. If the name is not found in `states-data`, an error is logged and the button does not update. If absent, the button renders with an empty icon. |

**State object shape:**
```json
{ "name": "unlocked", "iconName": "lock_open" }
```

### Events

| Event | `bubbles` | `composed` | `detail` | Description |
|---|---|---|---|---|
| `button-state-requested` | ✅ | ✅ | `{ requestedState: string }` | Fired on click. `requestedState` is the `name` of the next state in carousel order. The component does **not** change state on its own — set `current-state` externally to confirm the transition. |

### CSS Custom Properties

| Property | Default | Description |
|---|---|---|
| `--secondary-color` | `#ffffff00` (transparent) | Background colour of the button inner container. |
| `--button-widget-padding` | `2px` | Padding inside the button inner container. |

### Usage

```html
<script type="module" src="edirom-button-widget.js"></script>

<!-- Two-state lock toggle -->
<edirom-button-widget
  states-data='[{"name":"unlocked","iconName":"lock_open"},{"name":"locked","iconName":"lock_closed"}]'
  current-state="unlocked">
</edirom-button-widget>

<!-- Handling the state-change request externally -->
<script>
  const btn = document.querySelector('edirom-button-widget');
  btn.addEventListener('button-state-requested', (e) => {
      btn.setAttribute('current-state', e.detail.requestedState);
  });
</script>

<!-- Inside a control bar -->
<edirom-control-bar gap="8px">
  <edirom-button-widget
    states-data='[{"name":"play","iconName":"play"},{"name":"pause","iconName":"pause"}]'
    current-state="play">
  </edirom-button-widget>
  <edirom-spacer-widget></edirom-spacer-widget>
  <edirom-button-widget
    states-data='[{"name":"unlocked","iconName":"lock_open"},{"name":"locked","iconName":"lock_closed"}]'
    current-state="unlocked">
  </edirom-button-widget>
</edirom-control-bar>
```

---

## `edirom-control-bar`

A horizontal flex-row container for control widgets. It fills the full width and height of its parent and centers all child widgets vertically. Widgets are inserted via the default slot — no `slot="..."` attribute needed on children.

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `layout-mode` | `"desktop"` \| `"mobile"` | `"desktop"` | Switches the template. Desktop uses `8px` horizontal padding, mobile uses `4px`. |
| `gap` | CSS length string | `"0"` | Gap between child widgets, passed directly to the CSS `gap` property (e.g. `"8px"`, `"0.5rem"`). |

### Usage

```html
<script src="edirom-control-bar.js"></script>
<script src="edirom-spacer-widget.js"></script>

<!-- Basic bar -->
<edirom-control-bar gap="8px">
  <edirom-button>Back</edirom-button>
  <edirom-button>Forward</edirom-button>
</edirom-control-bar>

<!-- Left group / right group separated by a spacer -->
<edirom-control-bar gap="8px">
  <edirom-button>Left</edirom-button>
  <edirom-spacer-widget></edirom-spacer-widget>
  <edirom-slider></edirom-slider>
  <edirom-menu></edirom-menu>
</edirom-control-bar>

<!-- Three groups with unequal spacing between them -->
<edirom-control-bar gap="8px">
  <edirom-button>Left</edirom-button>
  <edirom-spacer-widget></edirom-spacer-widget>
  <edirom-button>Center</edirom-button>
  <edirom-spacer-widget grow="2"></edirom-spacer-widget>
  <edirom-button>Right</edirom-button>
</edirom-control-bar>

<!-- Mobile layout -->
<edirom-control-bar layout-mode="mobile" gap="4px">
  <edirom-button>A</edirom-button>
  <edirom-spacer-widget></edirom-spacer-widget>
  <edirom-button>B</edirom-button>
</edirom-control-bar>
```

---

## `edirom-spacer-widget`

A layout helper that expands to fill available space in the flex row of an `edirom-control-bar`. Inserting a spacer between two widgets pushes the widgets on either side to opposite ends of the bar. Multiple spacers with different `grow` values create proportional spacing groups.

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `grow` | Number | `1` | Maps to CSS `flex-grow`. A spacer-widget with `grow="2"` consumes twice the available space compared to a default spacer-widget. |

### Usage

```html
<!-- Equal spacing on both sides of a centered group -->
<edirom-control-bar gap="8px">
  <edirom-spacer-widget></edirom-spacer-widget>
  <edirom-button>Centered</edirom-button>
  <edirom-spacer-widget></edirom-spacer-widget>
</edirom-control-bar>

<!-- Weighted: center item closer to the right -->
<edirom-control-bar gap="8px">
  <edirom-spacer-widget grow="2"></edirom-spacer-widget>
  <edirom-button>Skewed right</edirom-button>
  <edirom-spacer-widget></edirom-spacer-widget>
</edirom-control-bar>
```
