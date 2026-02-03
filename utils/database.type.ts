export interface User {
  username: string;
  profilePublic: boolean;
  id: string;
  email: string;
  name?: string;
  image?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  subscription_status: "free" | "premium";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_period_end?: string;
}
