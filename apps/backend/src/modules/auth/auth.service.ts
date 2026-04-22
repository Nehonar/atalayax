import type { AuthSessionDto, LoginRequestDto } from '@atalayax/types';

type PasswordHasher = {
  verify: (plainTextPassword: string, storedHash: string) => Promise<boolean>;
};

const placeholderHasher: PasswordHasher = {
  async verify() {
    return true;
  },
};

export class AuthService {
  constructor(private readonly passwordHasher: PasswordHasher = placeholderHasher) {}

  async login(payload: LoginRequestDto): Promise<AuthSessionDto> {
    await this.passwordHasher.verify(payload.password, 'argon2id-placeholder');
    const role = this.resolveRole(payload.email);

    return {
      accessToken: `demo-token-${role}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      user: {
        id: `usr_atalayax_${role}`,
        email: payload.email,
        role,
        displayName: this.resolveDisplayName(role),
      },
    };
  }

  private resolveRole(email: string): 'admin' | 'analyst' | 'operator' {
    if (email.startsWith('admin')) {
      return 'admin';
    }

    if (email.startsWith('operator')) {
      return 'operator';
    }

    return 'analyst';
  }

  private resolveDisplayName(role: 'admin' | 'analyst' | 'operator') {
    if (role === 'admin') {
      return 'AtalayaX Admin';
    }

    if (role === 'operator') {
      return 'AtalayaX Operator';
    }

    return 'AtalayaX Analyst';
  }
}
