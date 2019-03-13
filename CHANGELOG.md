# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
