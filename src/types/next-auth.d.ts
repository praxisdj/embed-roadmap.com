export declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      username: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    name: string;
    picture: string;
    username: string;
  }
}
