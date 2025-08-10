"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

// Esquema de validação para o formulário
const formSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas devem ser iguais",
  path: ["confirmPassword"],
});

// Tipagem para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const router = useRouter();

  // Inicialize o formulário com o esquema e os valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Função de envio do formulário
  async function onSubmit(values: FormValues) {
    console.log("Formulário válido, enviado com os dados:", values);
    // Aqui você pode adicionar a lógica para autenticação
    await authClient.signUp.email({
      name: values.nome,
      email: values.email,
      password: values.password,
      fetchOptions: {
        onSuccess: () => {
          console.log("Usuário criado com sucesso");
          toast.success("Usuário criado com sucesso");
          router.push("/");
        },
        onError: (error) => {
          if (error.error.code === "USER_ALREADY_EXISTS") {
            toast.error("Email já cadastrado!");

            form.setError("email", {
              message: "Email já cadastrado!",
            });
          }
          console.error("Erro ao criar usuário:", error);
        }
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Crie uma conta para começar a usar nossos serviços.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Digite seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Digite seu email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
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
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">
                Criar conta
              </Button>
            </CardFooter>
          </form>
        </Form>

      </Card>
    </>
  );
}

export default SignUpForm;
