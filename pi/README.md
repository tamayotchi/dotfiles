# Pi config

This directory mirrors the safe, versioned parts of `~/.pi`.

## Versioned here

- `package.json` -> local Pi package manifest
- `extensions/` -> custom extensions
- `themes/` -> custom themes / UI colors
- `skills/` -> custom skills
- `prompts/` -> prompt templates

## Intentionally not versioned

Machine-local settings, runtime files, and secrets are ignored, including:

- `agent/` -> Pi-managed settings, keybindings, installed packages, sessions, and secrets
- `exa-usage.json`
- `web-search.json`

## Notes

The old standalone `pi-workspace` repo is replaced by the `pi/` folder in the main dotfiles repo.
