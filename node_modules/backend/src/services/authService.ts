import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database/db';
import { User, CreateUserInput } from '../models/User';
import { CreateUserProgressInput } from '../models/UserProgress';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    level: number;
    xp: number;
  };
}

export class AuthService {
  /**
   * Validate email format
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Requirements: At least 8 characters, contains letter and number
   */
  private static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  }

  /**
   * Hash password using bcrypt
   */
  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  private static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  private static generateToken(userId: string, username: string): string {
    const payload = { userId, username };
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, username, password } = input;

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message || 'Invalid password');
    }

    // Check if email already exists
    const existingUser = await db<User>('users').where({ email }).first();

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await db<User>('users').where({ username }).first();

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const userId = uuidv4();
    const userInput: CreateUserInput = {
      username,
      email,
      password_hash: passwordHash,
    };

    await db<User>('users').insert({
      id: userId,
      ...userInput,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Initialize user progress with "Apprentice Coder" rank and 0 XP
    const progressInput: CreateUserProgressInput = {
      user_id: userId,
      xp: 0,
      level: 1,
      current_chapter: null,
      current_quest: null,
    };

    await db('user_progress').insert({
      id: uuidv4(),
      ...progressInput,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generate JWT token
    const token = this.generateToken(userId, username);

    return {
      token,
      user: {
        id: userId,
        username,
        email,
        level: 1,
        xp: 0,
      },
    };
  }

  /**
   * Login user
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await db<User>('users').where({ email }).first();

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Get user progress
    const progress = await db('user_progress').where({ user_id: user.id }).first();

    // Generate JWT token
    const token = this.generateToken(user.id, user.username);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: progress?.level || 1,
        xp: progress?.xp || 0,
      },
    };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): { userId: string; username: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
