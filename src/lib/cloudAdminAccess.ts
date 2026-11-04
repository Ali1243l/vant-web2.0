export async function requireCloudAdmin(client: any): Promise<void> {
  if (!client) throw new Error('اتصال Supabase غير متاح.');
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) throw new Error('سجّل دخول حساب أدمن Supabase لتفعيل رفع الصور.');
  const result = await client.rpc('is_admin');
  if (result.error || result.data !== true) throw new Error('الحساب الحالي لا يملك صلاحية إدارة صور المتجر.');
}
export function cloudSignInError(error: { code?: string; status?: number; name?: string }, isAr: boolean): string {
  if (error.code === 'invalid_credentials') return isAr
    ? 'Supabase رفض البريد أو كلمة المرور لحساب المتجر. استخدم حساب الأدمن من Authentication → Users؛ كلمة مرور لوحة Supabase ورمز قفل الموقع لا يسجّلان الدخول هنا.'
    : 'Supabase rejected the store account email or password. Use the admin account in Authentication → Users, not the Supabase dashboard password or site lock code.';
  if (error.code === 'email_not_confirmed') return isAr ? 'بريد حساب المتجر غير مؤكّد. أكّد البريد أولاً ثم أعد المحاولة.' : 'Confirm the store account email before signing in.';
  if (error.status === 429) return isAr ? 'محاولات دخول كثيرة. انتظر قليلاً قبل إعادة المحاولة.' : 'Too many sign-in attempts. Wait before trying again.';
  if (error.code === 'user_banned') return isAr ? 'حساب المتجر موقوف. راجع حالة الحساب في Supabase.' : 'The store account is suspended. Check its status in Supabase.';
  if (error.name === 'AuthRetryableFetchError') return isAr ? 'تعذّر الاتصال بخدمة تسجيل الدخول. تحقق من اتصال الإنترنت ثم أعد المحاولة.' : 'Could not reach the sign-in service. Check your connection and try again.';
  return isAr ? 'تعذّر تسجيل الدخول. راجع إعدادات Authentication وسجل الأخطاء في Supabase.' : 'Sign-in failed. Check Supabase Authentication settings and logs.';
}

