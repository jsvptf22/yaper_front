export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  username: string;
  coins: number;
  token: string;
}

export interface BankAccount {
  _id: string;
  user_id: string;
  customName: string;
  bankName: string;
  type: string;
  number: string;
  description: string;
  created_at: Date;
}