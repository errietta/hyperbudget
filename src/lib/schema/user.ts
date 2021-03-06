import { Document, Schema, Model, model } from 'mongoose';
import { Category, Transaction } from '@hyperbudget/hyperbudget-core';

export interface User {
  id?: any;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  preferences?: {
    categories: Category[],
    categories_encrypted: string,
  };
  data?: {
    transactions?: Transaction[],
    transactions_encrypted?: string,
  }

  forAPI(): void;
};

export interface IUserModel extends User, Document {}

export const UserSchema: Schema = new Schema(
  {
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
    preferences: {
      categories_encrypted: String,
    },
    data: {
      transactions_encrypted: String,
    },
  },
  {
    minimize: false,
  }
);

UserSchema.methods.forAPI = function () {
  return {
    id: this.id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
  };
};

export const UserModel: Model<IUserModel> = model<IUserModel>("user", UserSchema);
