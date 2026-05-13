# Pi config

This directory mirrors the safe, versioned parts of `~/.pi`.

## Versioned here

- `agent/settings.json` -> global Pi settings
- `agent/keybindings.json` -> Pi keybindings
- `agent/APPEND_SYSTEM.md` -> extra global instructions
- `package.json` -> local Pi package manifest
- `extensions/` -> custom extensions
- `themes/` -> custom themes / UI colors
- `skills/` -> custom skills
- `prompts/` -> prompt templates

## Intentionally not versioned

Machine-local runtime files and secrets are ignored, including:

- `agent/auth.json`
- `agent/mcp-cache.json`
- `agent/models.json`
- `agent/sessions/`
- `agent/git/`
- `agent/extensions/`
- `agent/skills/`
- `exa-usage.json`
- `web-search.json`

## Notes

The old standalone `pi-workspace` repo is replaced by the `pi/` folder in the main dotfiles repo.
