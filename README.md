# dotfiles

Main workspace for small personal configs, with larger configs linked as separate repos.

## Layout

- `pi/` -> current `~/.pi` config/package content, excluding runtime files and secrets
- `hm/` -> small Home Assistant helper config/script from `~/hm`
- `tmux/` -> tmux config from `~/.config/tmux/tmux.conf`
- `nvim/` -> Git submodule pointing to [`tamayotchi/nvim`](https://github.com/tamayotchi/nvim)

## Clone

```bash
git clone --recurse-submodules git@github.com:tamayotchi/dotfiles.git ~/dotfiles
```

If you already cloned without submodules:

```bash
cd ~/dotfiles
git submodule update --init --recursive
```

## Install links

```bash
cd ~/dotfiles
./install.sh
```

The installer creates backups before replacing existing files/directories.

