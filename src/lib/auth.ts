import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email atau NIK", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Cari user berdasarkan email ATAU nik (fleksibel untuk login)
          const { rows } = await sql`
            SELECT id, nik, nama, email, password, role 
            FROM data_akun 
            WHERE email = ${credentials.email} OR nik = ${credentials.email}
          `;

          const user = rows[0];

          // Jika user tidak ditemukan di database
          if (!user) return null;

          // Bandingkan password yang diinput dengan password hash di database
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) return null;

          // Jika sukses, kembalikan objek user
          return {
            id: user.id,
            name: user.nama,
            email: user.email,
            role: user.role,
            nik: user.nik,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Menyimpan data tambahan (role, nik) ke dalam token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nik = user.nik;
      }
      return token;
    },
    // Mengoper data dari token JWT agar bisa dibaca oleh halaman web (Client/Server)
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.nik = token.nik as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Arahkan pengguna ke halaman login kustom kita
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
