export function isPasswordRecoveryUrl(url: string): boolean {
  const parsed = new URL(url);
  const fragment = new URLSearchParams(parsed.hash.slice(1));
  return parsed.searchParams.get('auth') === 'recovery' || fragment.get('type') === 'recovery' || fragment.get('error_code') === 'otp_expired';
}

export async function saveRecoveredPassword(client: any, password: string, confirmation: string): Promise<void> {
  if (password.length < 8 || password.length > 128) throw new Error('اختَر كلمة مرور بين 8 و128 حرفاً.');
  if (password !== confirmation) throw new Error('كلمتا المرور غير متطابقتين.');
  if (!client) throw new Error('اتصال خدمة الحسابات غير متاح.');
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) throw new Error('جلسة الاستعادة غير صالحة. اطلب رابطاً جديداً وافتح أحدث رسالة مرة واحدة.');
  const result = await client.auth.updateUser({ password });
  if (result.error) {
    if (result.error.code === 'same_password') throw new Error('اختَر كلمة مرور مختلفة عن الحالية.');
    if (result.error.code === 'weak_password') throw new Error('كلمة المرور لا تحقق شروط Supabase. اختَر كلمة أطول تتضمن حروفاً وأرقاماً ورموزاً.');
    throw new Error('تعذّر حفظ كلمة المرور. تحقق من الاتصال وصلاحية رابط الاستعادة ثم أعد المحاولة.');
  }
}
