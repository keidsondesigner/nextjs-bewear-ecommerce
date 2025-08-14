"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Esquema de validação para o formulário
const formSchema = z.object({
  email: z.email("Email inválido"),
});

// Tipagem para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

const ForgotPasswordForm = () => {
  const router = useRouter();

  // Inicialize o formulário com o esquema e os valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Função de envio do formulário
  async function onSubmit(values: FormValues) {
    console.log("Formulário recuperação de senha, enviado com os dados:", values);

    await authClient.forgetPassword({
      email: values.email,
      redirectTo: "/auth/reset-password",
      fetchOptions: {
        onSuccess: () => {
          console.log("Email de recuperação de senha enviado com sucesso");
          toast.success("Email de recuperação de senha enviado com sucesso");
          router.push("/auth");
        },
        onError: (error) => {
          console.error("Erro ao enviar email de recuperação de senha:", error);
          
          if (error.error?.code === "USER_NOT_FOUND") {
            toast.error("Email não encontrado");
            return form.setError("email", {
              message: "Email não encontrado",
            });
          }

          if (error.error?.code === "INVALID_EMAIL_OR_PASSWORD") {
            toast.error("Email inválido");
            return form.setError("email", {
              message: "Email inválido",
            });
          }

          // Generic error handling
          toast.error("Erro ao enviar email de recuperação. Tente novamente.");
          console.error("Full error details:", JSON.stringify(error, null, 2));
        },
      },
    });
  }

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Recuperação de senha</CardTitle>
          <CardDescription>
            Digite seu email para redefinir sua senha.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/auth" className="text-sm text-blue-500">Voltar para o login</Link>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}

export default ForgotPasswordForm;