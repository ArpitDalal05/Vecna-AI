type EventCallback = (payload: any) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== callback);
  }

  emit(event: string, payload?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(payload);
      } catch (err) {
        console.error(`Error in EventBus listener for event "${event}":`, err);
      }
    });
  }
}

export const eventBus = new EventBus();
export default eventBus;
