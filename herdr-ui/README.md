# Herdr desktop UI

Portable config for `herdr-app`, saved from `~/.config/herdr-app/`.
The terminal UI config lives separately in `../herdr-tui/`.

## Included

- `keys.json`: desktop shortcuts and native backtick key sequences.
- `settings.json`: fonts, terminal metrics, zoom and sounds.
- `layouts/tamayotchi.json` and preview: personal layout.
- `mods/tama-*/`: personal command palette, lazygit popup,
  quiet toasts, spaces, agents, tabs and pane headers, plus their assets.

Herdr supplies the remaining mods, icons and themes. These copies were based on
Herdr 0.1.16; validate them after upgrading. Do not overwrite the shipped mods.

No sessions, terminal contents, sockets, logs, telemetry, backups, generated API
files, or app-owned `shared.json`, `view.json`, and layout click state are saved.
The active layout and per-space open panels are therefore not restored automatically.

## Prefix shortcuts

Press backtick, release, then:

| Key | Action |
| --- | --- |
| `?` | All commands, with your prefix bindings shown first |
| `b` | Toggle left sidebar |
| `c` | New tab |
| `,` / `.` | Previous / next tab |
| `[` / `]` | Previous / next space |
| `t` | New space |
| `Shift+D` | Close space |
| `Shift+X` | Close tab |
| `Shift+R` | Rename tab |
| `h/j/k/l` | Focus left/down/up/right |
| `\|` / `-` | Split right/down |
| `f` | Zoom pane |
| `Alt+g` | Lazygit popup (90% width/height) |
| backtick | Type a literal backtick |
| `Escape` | Cancel prefix |

Backtick combinations use Herdr/GPUI's native key sequences in `keys.json`
(for example, backtick then `c` runs `tab.new`). No prefix mod, popup, focus transfer or
banner is created. `q` completes a no-op sequence: settings and mods already
reload automatically when saved. Other desktop shortcuts remain available.
The personalized palette reads the actual bindings from `keys.json` and prefers
backtick sequences over alternative desktop shortcuts.

The personal layout adds status dots, pane labels, quiet toasts and sidebar
`j/k` navigation. The personal command palette initializes priority sorting and skips onboarding
once on each new installation. Sounds are configured independently of toasts.
The TUI's experimental pane-history option has no desktop equivalent.

## Manual restore

This repository has no automatic installer. Install and start Herdr once so it
creates its shipped files, then review and back up the destination before copying.
For a custom `HERDR_APP_HOME`, use that directory instead of `~/.config/herdr-app`.

```bash
cd ~/dotfiles
backup="$HOME/.local/state/herdr-ui-backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup"
cp -a ~/.config/herdr-app "$backup/"

# These replace only the saved personal config files, not the whole app home.
cp herdr-ui/{keys.json,settings.json} ~/.config/herdr-app/
cp herdr-ui/layouts/tamayotchi.{json,svg} ~/.config/herdr-app/layouts/
for dir in herdr-ui/mods/tama-*; do
  mkdir -p "$HOME/.config/herdr-app/mods/${dir##*/}"
  cp -a "$dir/." "$HOME/.config/herdr-app/mods/${dir##*/}/"
done

for dir in ~/.config/herdr-app/mods/tama-*; do
  herdr-app check "$dir" || break
done
herdr-app status
```

After successful checks, optionally select the personalized layout:

```bash
herdr-app do layout.switch --name tamayotchi
```

The prefix bindings also work in the stock Herdr layout; appearance customizations
apply only in `tamayotchi`. Open backtick then `?` once after restoring to
initialize the shared preferences. No application restart is needed.

## Saving later edits

These are snapshots, **not symlinks**. Copy changed personal files back here when
wanted, review `git diff`, and omit generated `*.d.ts` / `jsconfig.json` files.
Do not sync or symlink the entire app home: Herdr owns much of its contents and
rewrites shipped files on startup. The local `.gitignore` keeps only the selected
portable paths eligible for tracking.
