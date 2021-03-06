## Secure Entry for JavaScript
v1.0.7+

## Introduction

The JavaScript Secure Entry library allows you to render secure tokens for
tickets in mobile web browsers. It will render at a minimum size of 216x160 and
scale up at this aspect ratio to fit its parent element.

CDN Link: https://secure-entry.ticketmaster.com/presence-secure-entry.min.js
AMD CDN Link: https://secure-entry.ticketmaster.com/presence-secure-entry.amd.min.js

Secure Token:

![pdf417](static/img/js-pdf417.png)

QR code fallback:

![qr code](static/img/js-qrcode.png)

## Usage

```html
<div id="token-container" style="width: 282px"></div>
<script type="text/javascript" src="https://secure-entry.ticketmaster.com/presence-secure-entry.min.js"></script>
<script type="text/javascript">
    // Initialize the SDK.
    Presence.init();

    // Set configuration during instantiation.
    const renderer = new Presence.SecureEntryView({
        selector: '#token-container',
        token: 'eyJiIjoiYiIsInQiOiJ0IiwiY2siOiJjayIsImVrIjoiZWsiLCJzIjoicyIsImQiOiJkIn0='
    });

    // Or set configuration after instantiation.
    const renderer = new Presence.SecureEntryView();
    renderer.setSelector('#token-container');
    renderer.setToken('eyJiIjoiYiIsInQiOiJ0IiwiY2siOiJjayIsImVrIjoiZWsiLCJzIjoicyIsImQiOiJkIn0=');

</script>
```

## API

<a name="init"></a>

## init([options])
Initialize the SDK.

**Kind**: global function
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> |  |
| [options.timeDelta] | <code>Number</code> | The time difference (in milliseconds) between a trusted server and the local device. |

**Example**
```js
// Accept default time sync.
Presence.init();

// Provide your own trusted time delta of 3.5 minutes in milliseconds.
Presence.init({ timeDelta: 210000 });
```

<a name="containerSizes"></a>

## containerSizes : <code>enum</code>
Known container sizes for rendering barcode containers.

**Kind**: global enum
**Access**: public
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| SIZE_216x160 | <code>String</code> | 216x160 |
| SIZE_278x127 | <code>String</code> | 278x127 |

<a name="SecureEntryView"></a>

## SecureEntryView
**Kind**: global class
**Access**: public

* [SecureEntryView](#SecureEntryView)
    * [new exports.SecureEntryView([options])](#new_SecureEntryView_new)
    * [.setSelector(sel)](#SecureEntryView+setSelector)
    * [.setToken(token, [parseErrorText])](#SecureEntryView+setToken)
    * [.setBrandingColor(color)](#SecureEntryView+setBrandingColor)
    * [.setErrorText(errorText)](#SecureEntryView+setErrorText)
    * [.showError(error)](#SecureEntryView+showError)
    * [.enableBrandedSubtitle(isEnabled)](#SecureEntryView+enableBrandedSubtitle)
    * [.setPDF417Subtitle(subtitle)](#SecureEntryView+setPDF417Subtitle)
    * [.setQRCodeSubtitle(subtitle)](#SecureEntryView+setQRCodeSubtitle)
    * [.teardown()](#SecureEntryView+teardown)

<a name="new_SecureEntryView_new"></a>

### new exports.SecureEntryView([options])
Class for rendering secure entry tokens in PDF417 format.

A token will be rendered immediately after the instance is "renderable".

The view is considered renderable when it has a valid CSS query selector and
a token or an error is set with `showError`.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Configuration options for the renderer. |
| [options.selector] | <code>String</code> \| <code>Node</code> | A selector or DOM node for the HTML container element the token will render in. |
| [options.token] | <code>String</code> | A secure token retrieved from the Presence Delivery API. |
| [options.containerSize] | <code>String</code> | A known container size to use for rendering. Default is 216x160. See global `containerSizes` for supported values. |
| [options.error] | <code>Object</code> | An error object. |
| [options.brandingColor] | <code>String</code> | A CSS hex color value. |
| [options.errorText] | <code>String</code> | Deprecated: Use optional parameter to `setToken` instead. |

**Example**
```js
const seView = new Presence.SecureEntryView({
    selector: '#token-container',
    token: '1234567890'
});

const seView = new Presence.SecureEntryView({
    selector: aDOMNode,
    token: '1234567890'
});
```
<a name="SecureEntryView+setSelector"></a>

### secureEntryView.setSelector(sel)
Set the selector of the containing HTML element for this renderer to
render into.

If a valid token is already set, the token will be rendered immediately.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| sel | <code>String</code> \| <code>Node</code> | A selector or DOM node for the HTML container element the token will render in. |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setSelector('#token-container');

const seView = new Presence.SecureEntryView();
seView.setSelector(aDOMNode);
```
<a name="SecureEntryView+setToken"></a>

### secureEntryView.setToken(token, [parseErrorText])
Set the token for this renderer.

If a valid selector is already set, the token will be rendered immediately.

Optionally customize any token parsing errors.

Note that there is 60 character limit. If the character limit is
exceeded, the text "Reload ticket" is rendered instead.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| token | <code>String</code> | A secure token retrieved from the Presence Delivery API. |
| [parseErrorText] | <code>String</code> | The error text to use if token parsing fails. Defaults to "Reload ticket" |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setToken('123456');

const seView = new Presence.SecureEntryView();
seView.setToken('123456', 'Please visit the box office');
```
<a name="SecureEntryView+setBrandingColor"></a>

### secureEntryView.setBrandingColor(color)
Set color to use for themeable portions of the renderer.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| color | <code>String</code> | A CSS hex color value. |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setBrandingColor('#076CD9');
```
<a name="SecureEntryView+setErrorText"></a>

### secureEntryView.setErrorText(errorText)
Deprecated: Use `setToken(token, parseErrorText)` instead.

Sets the error text to display if there is an error parsing the provided
token.

Note that there is 60 character limit. If the character limit is
exceeded, the text "Reload ticket" is rendered instead.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| errorText | <code>String</code> | The error text to use. Defaults to "Reload ticket" |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setErrorText('Please visit the box office');
```
<a name="SecureEntryView+showError"></a>

### secureEntryView.showError(error)
Displays a custom error message.

Note that there is 60 character limit. If the character limit is
exceeded, the text "Reload ticket" is rendered instead.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Object</code> | An error object. |
| error.text | <code>String</code> | The text of the error |
| [error.iconURL] | <code>String</code> | A URL for a 36x32 image for the error icon. |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.showError({
    text: 'Ticket not found'
    iconURL: 'https://your-cdn.com/36x32-error.png'
});
```
<a name="SecureEntryView+enableBrandedSubtitle"></a>

### secureEntryView.enableBrandedSubtitle(isEnabled)
Allows branding color on subtitle text to be enabled.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| isEnabled | <code>Boolean</code> | Whether or not subtitle should use branding color |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setBrandingColor('#076CD9');
seView.enableBrandedSubtitle(true)
```
<a name="SecureEntryView+setPDF417Subtitle"></a>

### secureEntryView.setPDF417Subtitle(subtitle)
Creates a custom subtitle for the PDF417 variant of the SafeTix ticket.
Will truncate if longer than the barcode.

Note: If set to a falsy value, the barcode subtitle will be hidden.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| subtitle | <code>String</code> | The text to display beneath PDF417 barcode |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setPDF417Subtitle('A custom subtitle');
```
<a name="SecureEntryView+setQRCodeSubtitle"></a>

### secureEntryView.setQRCodeSubtitle(subtitle)
Creates a custom subtitle for the QR code variant of the SafeTix ticket.
Will truncate if longer than the barcode.

Note: If set to a falsy value, the barcode subtitle will be hidden.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| subtitle | <code>String</code> | The text to display beneath QR barcode |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setQRCodeSubtitle('A custom subtitle');
```
<a name="SecureEntryView+teardown"></a>

### secureEntryView.teardown()
Performs clean steps so that the SecureEntryView can be safely removed from DOM tree.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public
**Example**
```js
const seView = new Presence.SecureEntryView();

// Sometime later prior to removing the container element or SecureEntryView from DOM tree.
seView.teardown();
```
