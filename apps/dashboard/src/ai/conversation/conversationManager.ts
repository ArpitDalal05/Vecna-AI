export interface Message {
  role: "system" | "user" | "assistant" | "agent";
  content: string;
  senderId?: string;
  missionId?: string;
  agentId?: string;
  timestamp: string;
}

export class ConversationManager {
  private history: Message[] = [];
  private maxTokens: number = 8000;

  constructor(maxTokens?: number) {
    if (maxTokens) this.maxTokens = maxTokens;
  }

  addMessage(
    role: "system" | "user" | "assistant" | "agent",
    content: string,
    senderId?: string,
    missionId?: string,
    agentId?: string
  ) {
    this.history.push({
      role,
      content,
      senderId,
      missionId,
      agentId,
      timestamp: new Date().toISOString()
    });
    this.trimContext();
  }

  getHistory(): Message[] {
    return [...this.history];
  }

  getHistoryByMission(missionId: string): Message[] {
    return this.history.filter(m => m.missionId === missionId);
  }

  getHistoryByAgent(agentId: string): Message[] {
    return this.history.filter(m => m.agentId === agentId);
  }

  clear() {
    this.history = [];
  }

  private trimContext() {
    let estimatedTokens = this.history.reduce((sum, msg) => sum + Math.floor(msg.content.length / 4), 0);
    
    while (estimatedTokens > this.maxTokens && this.history.length > 1) {
      const isSystem = this.history[0].role === "system";
      const deleteIndex = isSystem ? 1 : 0;
      
      if (deleteIndex < this.history.length) {
        this.history.splice(deleteIndex, 1);
      } else {
        break;
      }
      
      estimatedTokens = this.history.reduce((sum, msg) => sum + Math.floor(msg.content.length / 4), 0);
    }
  }

  async fetchSemanticContext(query: string): Promise<string[]> {
    return [];
  }
}
