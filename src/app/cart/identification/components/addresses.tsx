"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddAddressForm from "./add-address-form";
import { useShippingAddresses } from "@/hooks/queries/use-shipping-addresses";
import { useCreateShippingAddressMutation } from "@/hooks/mutations/use-create-shipping-address";
import { useUpdateCartShippingAddressMutation } from "@/hooks/mutations/use-update-cart-shipping-address";
import { CreateShippingAddressSchema } from "@/actions/create-shipping-address/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Addresses = () => {
  const [selectedAddresses, setselectedAddresses] = useState<string | null>(null);
  const { data: shippingAddresses, isLoading } = useShippingAddresses();
  const addShippingAddressMutation = useCreateShippingAddressMutation();
  const updateCartShippingAddressMutation = useUpdateCartShippingAddressMutation();
  const router = useRouter();

  const handleAddAddress = async (address: CreateShippingAddressSchema) => {
    try {
      const newAddress = await addShippingAddressMutation.mutateAsync(address);
      setselectedAddresses(newAddress.id);

      // Atualizar o carrinho com o novo endereço
      await updateCartShippingAddressMutation.mutateAsync({ shippingAddressId: newAddress.id });
      toast.success("Endereço vinculado ao carrinho com sucesso");

      // Redirecionar para a página de pagamento
      router.push("/cart/payment");
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Erro ao adicionar endereço");
    }
  };

  const handleGoToPayment = async () => {
    if (!selectedAddresses || selectedAddresses === "add_new_address") {
      toast.error("Por favor, selecione um endereço");
      return;
    }

    try {
      await updateCartShippingAddressMutation.mutateAsync({ shippingAddressId: selectedAddresses });
      toast.success("Endereço vinculado ao carrinho com sucesso");

      // Redirecionar para a página de pagamento
      router.push("/cart/payment");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Erro ao vincular endereço ao carrinho");
    }
  };
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Endereços</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando endereços...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Endereços</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <RadioGroup value={selectedAddresses} onValueChange={setselectedAddresses}>
            {shippingAddresses?.map((address) => (
              <Card key={address.id}>
                <div className="flex gap-4 px-5 items-center">
                  <RadioGroupItem value={address.id} id={address.id} />
                  <Label htmlFor={address.id} className="cursor-pointer">
                    <div className="text-sm">
                      <p className="font-medium">
                        {address.recipientName}: {address.street}, {address.number}
                        {address.complement ? `, ${address.complement}` : ""}
                      </p>
                      <p className="text-muted-foreground">
                        {address.neighborhood}, {address.city} - {address.state}
                      </p>
                    </div>
                  </Label>
                </div>
              </Card>
            ))}

            <Card>
              <div className="flex gap-4 px-5 items-center">
                <RadioGroupItem value="add_new_address" id="add_new_address" />
                <Label htmlFor="add_new_address" className="cursor-pointer">Adicionar novo endereço</Label>
              </div>
            </Card>
          </RadioGroup>
        </div>

        {selectedAddresses === "add_new_address" && (
          <AddAddressForm onSuccess={handleAddAddress} />
        )}

        {selectedAddresses && selectedAddresses !== "add_new_address" && (
          <Button
            onClick={handleGoToPayment}
            disabled={updateCartShippingAddressMutation.isPending}
            className="w-full"
          >
            {updateCartShippingAddressMutation.isPending ? "Salvando..." : "Ir para pagamento"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default Addresses;