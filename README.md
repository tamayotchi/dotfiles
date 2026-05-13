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

## Update tracked configs from the live system

```bash
cd ~/dotfiles
rsync -a --delete ~/.config/tmux/tmux.conf tmux/tmux.conf
rsync -a --delete --exclude .git/ ~/hm/ hm/
rsync -a --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='agent/auth.json' \
  --exclude='agent/mcp-cache.json' \
  --exclude='agent/models.json' \
  --exclude='agent/extensions/' \
  --exclude='agent/git/' \
  --exclude='agent/sessions/' \
  --exclude='agent/skills/' \
  --exclude='exa-usage.json' \
  --exclude='web-search.json' \
  ~/.pi/ pi/
```

Then commit and push:

```bash
git status
git add -A
git commit -m "Update dotfiles"
git push
```

## Notes

`pi-workspace` is no longer needed for this setup because the safe Pi config lives here under `pi/`. Do not commit Pi auth files, caches, sessions, or local usage data.
