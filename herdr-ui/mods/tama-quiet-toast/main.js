import { View, div } from "gpui-kit";
import { checking, props, closeOverlay } from "herdr";
export default class QuietToast extends View {
  init() { if (!checking() && props().overlay) closeOverlay(props().overlay); }
  render() { return div(); }
}
