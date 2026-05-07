import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  return <ConfirmDeleteButton endpoint={`/api/products/${productId}`} itemName={productName} />;
}
