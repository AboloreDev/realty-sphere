"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareValue = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
//  This file contains utility functions for hashing and comparing passwords using bcrypt.
const hashPassword = (value, saltRounds) => __awaiter(void 0, void 0, void 0, function* () { return bcryptjs_1.default.hash(value, saltRounds || 10); });
exports.hashPassword = hashPassword;
//  This function compares a plain text value with a hashed value.
// It returns true if they match, otherwise false.
// If an error occurs during comparison, it returns false.
// This is useful for validating user passwords during login.
// The function uses bcrypt's compare method to perform the comparison.
const compareValue = (value, hash) => __awaiter(void 0, void 0, void 0, function* () { return bcryptjs_1.default.compare(value, hash).catch(() => false); });
exports.compareValue = compareValue;
