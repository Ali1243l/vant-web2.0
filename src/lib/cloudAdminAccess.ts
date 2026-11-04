export async function requireCloudAdmin(client: any): Promise<void> {
  if (!client) throw new Error('اتصال Supabase غير متاح.');
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) throw new Error('سجّل دخول حساب أدمن Supabase لتفعيل رفع الصور.');
  const result = await client.rpc('is_admin');
  if (result.error || result.data !== true) throw new Error('الحساب الحالي لا يملك صلاحية إدارة صور المتجر.');
}
