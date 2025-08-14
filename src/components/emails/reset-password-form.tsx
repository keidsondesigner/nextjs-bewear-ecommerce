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
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

// Esquema de validação para o formulário
const formSchema = z.object({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas devem ser iguais",
  path: ["confirmPassword"],
});

// Tipagem para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

const ResetPasswordForm = () => {
  const router = useRouter();

  // Pegar o token da URL para resetar a senha
  const searchParams = useSearchParams();
  const params = useParams();
  
  // Try to get token from URL path params first, then from search params
  const token = (params?.token as string) || (searchParams.get("token") as string);

  // Inicialize o formulário com o esquema e os valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Função de envio do formulário
  async function onSubmit(values: FormValues) {
    console.log("Formulário recuperação de senha, enviado com os dados:", values);

    await authClient.resetPassword({
      newPassword: values.password,
      token: token,
      fetchOptions: {
        onSuccess: () => {
          console.log("Senha redefinida com sucesso");
          toast.success("Senha redefinida com sucesso");
          router.push("/auth");
        },
        onError: (error) => {
          console.error("Erro ao redefinir a senha:", error);
        },
      },
    });
  }

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>
            Digite sua nova senha
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-6">
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha" {...field} />
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

export default ResetPasswordForm;