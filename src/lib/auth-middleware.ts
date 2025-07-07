import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { Role } from '@prisma/client';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL));
  }
  
  return session;
}

export async function requireRole(requiredRoles: Role[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', process.env.NEXTAUTH_URL));
  }
  
  const hasRole = session.user.roles.some(role => requiredRoles.includes(role));
  
  if (!hasRole) {
    return NextResponse.redirect(new URL('/unauthorized', process.env.NEXTAUTH_URL));
  }
  
  return session;
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN]);
}

export async function requireCoordinator() {
  return requireRole([Role.CENTER_COORDINATOR, Role.SUPER_COORDINATOR, Role.ADMIN]);
}

export async function requireSuperCoordinator() {
  return requireRole([Role.SUPER_COORDINATOR, Role.ADMIN]);
}

export function hasRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role));
}

export function isAdmin(userRoles: Role[]): boolean {
  return hasRole(userRoles, [Role.ADMIN]);
}

export function isCoordinator(userRoles: Role[]): boolean {
  return hasRole(userRoles, [Role.CENTER_COORDINATOR, Role.SUPER_COORDINATOR, Role.ADMIN]);
}

export function isSuperCoordinator(userRoles: Role[]): boolean {
  return hasRole(userRoles, [Role.SUPER_COORDINATOR, Role.ADMIN]);
}

export function getDefaultDashboard(userRoles: Role[]): string {
  if (isAdmin(userRoles)) return 'admin';
  if (isSuperCoordinator(userRoles)) return 'super';
  if (isCoordinator(userRoles)) return 'coordinator';
  return 'user';
}