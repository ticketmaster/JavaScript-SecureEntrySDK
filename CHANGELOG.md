# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.5] - 2019-07-17
- Update time server resource URL.

## [1.0.4] - 2019-07-15
### Added
- Timestamp used to generate TOTP is now embedded in rendered PDF417 barcode.
- Server and integrator time sync support. `SecureEntryView` will now perform server check for
  current time to compare with device time. This can (and should) be done prior to rendering with
  the `Presence.init` function as early as possible.

## Fixed
- PDF417 now renders at proper device resolution, resulting in sharper barcodes and improved scan
  success rate.

## [1.0.3] - 2019-06-14
### Changed
- Changed PDF417 and QR code toggle trigger and animation. The touch area is now the entire
`SecureEntryView` and presentation animation is now cross fade.

### Added
- Support for displaying a configurable barcode subtitle, which by default reads 'Screenshots
are not valid'. This informs users they may not screenshot SafeTix barcodes for event entry.
Configuration can be done with:
    - `setPDF417Subtitle` and `setQRCodeSubtitle` which set text for each barcode variant. A falsy
      value removes subtitle completely.
    - `enableBrandedSubtitle` which allows subtitle text color customization matching the
      color provided in `setBrandingColor`.

## [1.0.2] - 2019-04-24
### Improved
- Branding color handling.
- Scanline animation uses a different easing function to match Android and iOS implementations.

### Added
- Ability to supply a DOM Node in addition to a CSS selector when configuring a `SecureEntryView`.
- `SecureEntryView.teardown` as a means of forcing clean up prior to removing the `SecureEntryView`
  from the DOM.

### Internal project changes
- Move to ES6 modules.
- Restructure project source.
- Renamed `TokenSigner` to `EntryData` to start matching native SDKs' nomenclature.
- Misc refactoring.

## [1.0.1] - 2019-03-22
### Added
- Optional parameter to `setToken` allowing customization of token parsing errors.
- `showError` method that allows displaying an error to the end user when there are issue retrieving
  a token from the Secure Renderer API.
- Support for new static PDF417 barcodes.

### Deprecated
- `SecureEntryView`'s `setErrorText(errorText)` method and `errorText` constructor option that allowed
  customization of token parsing errors. Use the less ambiguous `setToken(token, parseErrorText)` method
  instead.

## [1.0.0] - 2019-02-25
### Added
- AMD module support.
- Support for new Secure Token format.
- Animation while processing secure token.
- Dual barcode support (toggling between PDF417 and QR code).
- Visual error state when provided an invalid token as well as ability to customize error text via a new `setErrorText` method.

### Changed
- Improve visual cue of secure entry token changing by vertically flipping the PDF417 on every re-render.

### Fixed
- Issue where Secure Entry animation is offset on some sites.
- Issue where `SecureEntryView` does not render when configured with `setSelector` and `setToken` setters.
