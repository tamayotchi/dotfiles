import { View, div } from "gpui-kit";
import { checking, focused, spaces, props, hc, openOverlay, closeOverlay, run, theme } from "herdr";

export default class Lazygit extends View {
  init(_props, cx) {
    this.message = "Starting lazygit…";
    if (checking() || props()?.terminal) return;
    const focus = focused();
    const space = spaces().find(s => s.id === focus?.space);
    if (!focus?.terminal) { this.message = "Open a terminal first, then try again."; return; }
    cx.spawn(async (cx) => {
      try {
        const args = ["run", "--bg", "--json", "--no-parent", "--no-notify", "--rm"];
        if (space?.machine) args.push("--on", space.machine);
        // Follow the focused terminal's directory; never add workspace labels.
        if (focus.cwd) args.push("--cwd", focus.cwd);
        args.push("--", "lazygit");
        const result = await hc(args);
        if (result.code !== 0) throw new Error(result.stderr || result.stdout);
        const data = JSON.parse(result.stdout);
        const terminal = data.address;
        if (!terminal) throw new Error("Core returned no terminal address: " + result.stdout);
        this.terminal = terminal;
        openOverlay({ kind: "window", key: "tama-lazygit", width: 0.9, height: 0.9,
          layout: { type: "column", children: [
            { type: "block", size: { px: 32 }, content: { mod: "tama-lazygit", props: { terminal } } },
            { type: "block", content: { terminal } },
          ] } });
        this.transferred = true;
        run("pane.focus", { terminal });
        closeOverlay(props().overlay);
      } catch (error) { this.message = String(error); cx.notify(); }
    });
  }
  async close() {
    const terminal = props()?.terminal || (!this.transferred && this.terminal);
    if (terminal && !checking()) await hc(["kill", terminal]);
  }
  render() {
    const t = theme();
    if (!props()?.terminal) return div().p(12).text_color(t.foreground).child(this.message);
    return div().size_full().flex().items_center().justify_between().px(12).bg(t.surface)
      .text_color(t.foreground).text_size(12).child("lazygit — q to quit")
      .child(div().id("close-lazygit").px(8).cursor_pointer().child("✕")
        .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
        .on_click(() => closeOverlay(props().overlay)));
  }
}
