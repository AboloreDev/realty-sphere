import bcrypt from "bcryptjs";

//  This file contains utility functions for hashing and comparing passwords using bcrypt.
export const hashPassword = async (value: string, saltRounds: number) =>
  bcrypt.hash(value, saltRounds || 10);

//  This function compares a plain text value with a hashed value.
// It returns true if they match, otherwise false.
// If an error occurs during comparison, it returns false.
// This is useful for validating user passwords during login.
// The function uses bcrypt's compare method to perform the comparison.
export const compareValue = async (value: string, hash: string) =>
  bcrypt.compare(value, hash).catch(() => false);
