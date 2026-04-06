import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/db.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest, AuthResponse } from '../types';

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'STAFF' } = req.body;
      
      // 验证输入
      if (!name || !email || !password) {
        throw new AppError('Name, email and password are required', 400);
      }
      
      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        throw new AppError('User already exists', 400);
      }
      
      // 哈希密码
      const passwordHash = await bcrypt.hash(password, 10);
      
      // 创建用户
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: passwordHash,
          role: role as 'ADMIN' | 'STAFF'
        }
      });
      
      // 生成JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
      
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', 500);
    }
  }
  
  // 用户登录
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // 验证输入
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }
      
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // 生成JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
      
      res.json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }
  
  // 获取当前用户信息
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      res.json(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user', 500);
    }
  }
}