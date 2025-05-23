// frontend/app/dashboard/products/actions.ts
'use server';

import { deleteProductById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  await deleteProductById(id);
  revalidatePath('/dashboard/products');
}