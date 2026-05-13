#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backup_root="$HOME/.dotfiles-backup/$(date +%Y%m%d-%H%M%S)"

backup_path() {
  local target="$1"
  if [[ -e "$target" || -L "$target" ]]; then
    mkdir -p "$backup_root$(dirname "$target")"
    mv "$target" "$backup_root$target"
    echo "Backed up $target -> $backup_root$target"
  fi
}

link_path() {
  local source="$1"
  local target="$2"
  mkdir -p "$(dirname "$target")"
  backup_path "$target"
  ln -s "$source" "$target"
  echo "Linked $target -> $source"
}

if [[ ! -d "$repo_dir/nvim/.git" && ! -f "$repo_dir/nvim/.git" ]]; then
  echo "Initializing nvim submodule..."
  git -C "$repo_dir" submodule update --init --recursive
fi

link_path "$repo_dir/pi" "$HOME/.pi"
link_path "$repo_dir/hm" "$HOME/hm"
link_path "$repo_dir/tmux/tmux.conf" "$HOME/.config/tmux/tmux.conf"
link_path "$repo_dir/nvim" "$HOME/.config/nvim"

echo "Done. Backups, if any, are in: $backup_root"
