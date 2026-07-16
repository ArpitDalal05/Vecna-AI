export interface ProfileRow {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  role: string;
  nodeId: string;
  syncRank: string;
  organization: string;
  permissions: string[];
  preferences: {
    theme: "DARK" | "LIGHT" | "HOLOGRAPHIC";
    enableNotifications: boolean;
    syncFrequency: number;
  };
  createdAt: string;
  lastSignIn: string;
}

export let profileTable: ProfileRow = {
  id: "U1",
  email: "arpit.dalal23@vit.edu",
  fullName: "Arpit Dalal",
  designation: "Core Cognitive Unit Overlord",
  role: "HIVE_OVERLORD",
  nodeId: "847291",
  syncRank: "Initiate (L1)",
  organization: "Vecna Swarm Systems",
  permissions: ["metrics:read", "metrics:write", "decisions:trigger", "employees:update", "agents:execute", "logs:audit"],
  preferences: {
    theme: "DARK",
    enableNotifications: true,
    syncFrequency: 3000
  },
  createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  lastSignIn: new Date().toISOString()
};

export function updateProfileTable(updates: Partial<ProfileRow>) {
  profileTable = { ...profileTable, ...updates };
}
