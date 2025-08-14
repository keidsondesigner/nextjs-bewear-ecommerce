import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance

import * as schema from "@/db/schema";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({user, url, token}, request) => {
            try {
                console.log("Attempting to send reset password email to:", user.email);
                console.log("Reset URL:", url);

                await resend.emails.send({
                    from: "FunctionDev <noreply@functiondev.com.br>",
                    to: user.email,
                    subject: "Recuperação de senha",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2>Recuperação de Senha</h2>
                            <p>Olá,</p>
                            <p>Recebemos uma solicitação para redefinir a senha da sua conta associada ao email <strong>${user.email}</strong>.</p>
                            <p>Clique no botão abaixo para criar uma nova senha:</p>
                            <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
                                Redefinir Senha
                            </a>
                            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                            <p><a href="${url}">${url}</a></p>
                            <p><strong>Aviso de segurança:</strong> Se você não solicitou esta redefinição de senha, ignore este email. Sua senha permanecerá inalterada.</p>
                        </div>
                    `,
                });

                console.log("Email sent successfully");
            } catch (error) {
                console.error("Error sending reset password email:", error);
                throw error;
            }
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema,
    }),

    user: {
        modelName: "userTable",
    },
    session: {
        modelName: "sessionTable",
    },
    account: {
        modelName: "accountTable",
    },
    verification: {
        modelName: "verificationTable",
    },
});