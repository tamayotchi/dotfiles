# Pi config

This directory mirrors the safe, versioned parts of `~/.pi`.

## Versioned here

- `package.json` -> local Pi package manifest
- `extensions/` -> custom extensions
- `themes/` -> custom themes / UI colors
- `skills/` -> custom skills
- `prompts/` -> prompt templates

## Subagents

`extensions/subagent` is a Git submodule of [`badlogic/pi-subagent`](https://github.com/badlogic/pi-subagent): observable, persistent Pi subagents running in tmux. It is loaded through `package.json` and contributes the `subagent` skill and the `/subagent` command automatically.

Requirements: Node.js >= 22.19 and `tmux`.

The CLI must be linked manually on each machine (`~/.pi/agent/bin` is on Pi's bash `PATH`):

```bash
ln -s ~/dotfiles/pi/extensions/subagent/subagent.ts ~/.pi/agent/bin/subagent
```

Update to the latest upstream:

```bash
cd ~/dotfiles && git submodule update --remote pi/extensions/subagent
```

Then run `/reload` in Pi.

## Intentionally not versioned

Machine-local settings, runtime files, and secrets are ignored, including:

- `agent/` -> Pi-managed settings, keybindings, installed packages, sessions, and secrets
- `exa-usage.json`
- `web-search.json`

## Notes

The old standalone `pi-workspace` repo is replaced by the `pi/` folder in the main dotfiles repo.
