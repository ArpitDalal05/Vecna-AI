import { createClient } from "./client";

const supabase = createClient();

export const authHelpers = {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
