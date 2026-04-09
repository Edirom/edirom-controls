This repository is work in progress and highly experimental at the moment.

This repository collects web components that are used to control views in the Edirom. It consists of:

- `edirom-control-bar` — a wrapper web component for different constellations of control elements.
- different control elements in the form of small web components:
  - `edirom-button-widget` — a square icon button widget for use inside a control bar.
  - `edirom-spin-box-widget` — a step navigator with previous/next buttons and a text input.
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

---

## `edirom-spin-box-widget`

A step navigator for use inside an `edirom-control-bar`. It displays a text input flanked by a previous (`eo_previous`) and a next (`eo_next`) icon button. The user can step through a predefined list of values by clicking the icons or by typing a value into the text field and pressing Enter.

Like `edirom-button-widget`, this component follows an **external-state-only** pattern: clicking a button or submitting a text value dispatches a request event but does **not** change the current step. The host application must set the `current-step` attribute in response to validate and confirm the transition.

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `steps-data` | JSON string (array) | `'[]'` | Stringified array of step values. Each element can be a string or an integer (e.g. `'["Step 1", 2, "5", 100]'`). The array order defines the navigation sequence. All values are compared as strings internally. |
| `current-step` | string | — | The value of the active step. Must match a value in `steps-data` when compared as a string (e.g. set `"2"` to match the integer `2`). If the value is not found, a warning is logged and the display is not updated. When `steps-data` contains duplicate values, the occurrence nearest to the previously resolved index is selected (first occurrence on initial load). |
| `carrousel` | `"true"` \| `"false"` | `"false"` | When `"true"`, navigation wraps around: stepping past the last value continues at the first, and vice versa. When `"false"`, the previous button is hidden at the first step and the next button is hidden at the last step. |
| `label` | string | — | Optional short label rendered above the text input in a small font (~60% of the host font size). The label is left-aligned and truncated with an ellipsis (`…`) when it is wider than the input field. When set to a non-empty string, the input shrinks to 75% of the component height and its font size is reduced to 75% to leave room for the label. When absent or empty, the input occupies the full height and font size (no visual change). |

### Events

| Event | `bubbles` | `composed` | `detail` | Description |
|---|---|---|---|---|
| `spin-box-step-requested` | ✅ | ✅ | `{ requestedStep: string }` | Fired when the user clicks a navigation icon or submits a valid value via the text input (Enter key). `requestedStep` is the string value of the target step. The component does **not** change step on its own — set `current-step` externally to confirm the transition. If the user types a value not present in `steps-data`, no event is fired and the input reverts to the current step. |

### CSS Custom Properties

| Property | Default | Description |
|---|---|---|
| `--spin-box-input-width` | `4ch` | Width of the text input field. |
| `--spin-box-gap` | `0` | Gap between the previous icon, text input, and next icon. |
| `--spin-box-border-color` | `#ccc` | Border colour of the text input. |
| `--spin-box-border-radius` | `4px` | Border radius of the text input. |
| `--spin-box-input-padding` | `0 2px` | Padding inside the text input. |

### Usage

```html
<script type="module" src="edirom-spin-box-widget.js"></script>

<!-- Basic step navigation -->
<edirom-spin-box-widget
  steps-data='["Schritt 1", 2, "5", 100, "another string"]'
  current-step="Schritt 1">
</edirom-spin-box-widget>

<!-- Handling the step-change request externally -->
<script>
  const spin = document.querySelector('edirom-spin-box-widget');
  spin.addEventListener('spin-box-step-requested', (e) => {
      spin.setAttribute('current-step', e.detail.requestedStep);
  });
</script>

<!-- Carrousel mode -->
<edirom-spin-box-widget
  steps-data='["A", "B", "C"]'
  current-step="A"
  carrousel="true">
</edirom-spin-box-widget>

<!-- Custom input width -->
<style>
  .wide-spin-box {
    --spin-box-input-width: 10ch;
  }
</style>
<edirom-spin-box-widget
  class="wide-spin-box"
  steps-data='["Largo", "Andante", "Allegro", "Presto"]'
  current-step="Andante">
</edirom-spin-box-widget>

<!-- With a label above the input -->
<edirom-spin-box-widget
  steps-data='[1, 2, 3, 4, 5]'
  current-step="1"
  label="Annotationen">
</edirom-spin-box-widget>

<!-- Inside a control bar -->
<edirom-control-bar gap="8px">
  <edirom-spacer-widget></edirom-spacer-widget>
  <edirom-spin-box-widget
    steps-data='[1, 2, 3, 4, 5]'
    current-step="1">
  </edirom-spin-box-widget>
  <edirom-spacer-widget></edirom-spacer-widget>
</edirom-control-bar>
```
