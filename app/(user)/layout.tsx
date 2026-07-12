import { CartProvider } from "@/components/user/CartProvider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}