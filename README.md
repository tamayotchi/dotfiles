# dotfiles

Main workspace for small personal configs, with larger configs linked as separate repos.

This repo intentionally does **not** include an install/bootstrap script anymore. Existing symlinks on each machine are kept as-is and should be managed manually so nothing is replaced unexpectedly.

## Layout

- `pi/` -> current `~/.pi` config/package content, excluding runtime files and secrets
- `hm/` -> small Home Assistant helper config/script from `~/hm`
- `tmux/` -> tmux config from `~/.config/tmux/tmux.conf`
- `nvim/` -> Git submodule pointing to [`tamayotchi/nvim`](https://github.com/tamayotchi/nvim)
- `claude/` -> Claude user settings
- `herdr/` -> Herdr config

## Clone

```bash
git clone --recurse-submodules git@github.com:tamayotchi/dotfiles.git ~/dotfiles
```

If you already cloned without submodules:

```bash
cd ~/dotfiles
git submodule update --init --recursive
```

## Manual links

There is no automatic installer. Create or update links only when you intentionally want a machine to use a config from this repo.

Current expected links:

```text
~/.pi                         -> ~/dotfiles/pi
~/hm                          -> ~/dotfiles/hm
~/.config/tmux/tmux.conf      -> ~/dotfiles/tmux/tmux.conf
~/.config/nvim                -> ~/dotfiles/nvim
```

Before changing a link, check what already exists:

```bash
ls -la ~/.pi ~/hm ~/.config/tmux/tmux.conf ~/.config/nvim
```

If a path already exists and points somewhere else, review it manually instead of overwriting it.
