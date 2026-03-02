// Backward-compatible re-exports from the new composable
import { chatState, chatActions } from '../composables/useChat';

export const state = chatState;
export const actions = chatActions;
export default { state, actions };
