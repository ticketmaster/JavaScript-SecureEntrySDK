# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
