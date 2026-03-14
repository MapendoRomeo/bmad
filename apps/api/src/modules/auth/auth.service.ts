import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import { config } from '../../config/index.js';
import type { JwtPayload } from '../../middleware/auth.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface LoginResult {
  tokens: TokenPair;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    etablissementId: string;
  };
}

export async function login(
  email: string,
  motDePasse: string,
  etablissementId?: string,
): Promise<LoginResult> {
  const whereClause: Record<string, unknown> = {
    email,
    actif: true,
  };

  if (etablissementId) {
    whereClause.etablissementId = etablissementId;
  }

  const user = await prisma.utilisateur.findFirst({
    where: whereClause,
  });

  if (!user) {
    throw new Error('EMAIL_OR_PASSWORD_INVALID');
  }

  const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasseHash);

  if (!isPasswordValid) {
    throw new Error('EMAIL_OR_PASSWORD_INVALID');
  }

  const tokens = generateTokens(user);

  return {
    tokens,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      etablissementId: user.etablissementId,
    },
  };
}

export function generateTokens(user: {
  id: string;
  email: string;
  role: string;
  etablissementId: string;
}): TokenPair {
  const payload: JwtPayload = {
    userId: user.id,
    etablissementId: user.etablissementId,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiration,
  });

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiration },
  );

  return { accessToken, refreshToken };
}

export async function refreshToken(token: string): Promise<TokenPair> {
  let decoded: { userId: string; type: string };

  try {
    decoded = jwt.verify(token, config.jwt.refreshSecret) as {
      userId: string;
      type: string;
    };
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  if (decoded.type !== 'refresh') {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const user = await prisma.utilisateur.findFirst({
    where: { id: decoded.userId, actif: true },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return generateTokens(user);
}
