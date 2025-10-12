// arquivo usado para validar os dados da requisição

import { z } from "zod";

export const createShippingAddressSchema = z.object({
  recipientName: z.string().min(1, "Nome do destinatário é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  zipCode: z.string().min(1, "CEP é obrigatório"),
  country: z.string().min(1, "País é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  cpfOrCnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
});

export type CreateShippingAddressSchema = z.infer<typeof createShippingAddressSchema>;
