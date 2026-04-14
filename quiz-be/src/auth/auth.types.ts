export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  authorities: string[];
}

export interface RequestUser extends JwtPayload {}
