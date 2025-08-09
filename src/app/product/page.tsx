import { Button } from "@/components/ui/button";

const Product = () => {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1>Product Page</h1>
      <Button>Click Me</Button>
    </div>
  );
};

export default Product;