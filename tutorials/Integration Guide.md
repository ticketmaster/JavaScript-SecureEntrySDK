## Secure Entry for JavaScript
v1.0.0+

## Introduction

**NOTE:** This is a work in progress

The JavaScript Secure Entry library allows you to render secure tokens for
tickets in mobile web browsers. It will render at a minimum size of 216x160 and
scale up at this aspect ratio to fit its parent element.

CDN Link: https://secure-entry.ticketmaster.com/presence-secure-entry.min.js

Secure Token:

![pdf417](img/js-pdf417.png)

QR code fallback:

![qr code](img/js-qrcode.png)

## Usage

```html
<div id="token-container" style="width: 282px"></div>
<script type="text/javascript" src="https://secure-entry.ticketmaster.com/presence-secure-entry.min.js"></script>
<script type="text/javascript">

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

<a name="SecureEntryView"></a>

## SecureEntryView
**Kind**: global class
**Access**: public

* [SecureEntryView](#SecureEntryView)
    * [new SecureEntryView(options)](#new_SecureEntryView_new)
    * [.setSelector(sel)](#SecureEntryView+setSelector)
    * [.setToken(token)](#SecureEntryView+setToken)
    * [.setBrandingColor(color)](#SecureEntryView+setBrandingColor)
    * [.setErrorText(errorText)](#SecureEntryView+setErrorText)

<a name="new_SecureEntryView_new"></a>

### new SecureEntryView(options)
Class for rendering secure entry tokens in PDF417 format.

A token will be rendered immediately after the instance is "renderable".

A renderable token has a valid CSS query selector and token. These can be
provided on object instantiation or via setter methods afterward.


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configuration options for the renderer. |
| options.selector | <code>String</code> | A selector for the HTML container element the token will render in. |
| options.token | <code>String</code> | A secure token retrieved from the Presence Delivery API. |
| [options.brandingColor] | <code>String</code> | A CSS hex color value. |
| [options.errorText] | <code>String</code> | The error text to use if token parsing fails. Defaults to "Reload ticket" |

**Example**
```js
const seView = new Presence.SecureEntryView({
    selector: '#token-container',
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
| sel | <code>String</code> | A selector for the HTML container element the token will render in. |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setSelector('#token-container');
```
<a name="SecureEntryView+setToken"></a>

### secureEntryView.setToken(token)
Set the token for this renderer.

If a valid selector is already set, the token will be rendered immediately.

**Kind**: instance method of [<code>SecureEntryView</code>](#SecureEntryView)
**Access**: public

| Param | Type | Description |
| --- | --- | --- |
| token | <code>String</code> | A secure token retrieved from the Presence Delivery API. |

**Example**
```js
const seView = new Presence.SecureEntryView();
seView.setToken('123456');
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
