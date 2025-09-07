import * as crypto from 'crypto';

export type ValidatedInit = {
  fields: Record<string, string>;
  user?: unknown;
};

export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 600,
): ValidatedInit {
  const params = new URLSearchParams(initData);

  const hash = params.get('hash');
  if (!hash) throw new Error('Missing hash');

  params.delete('hash');
  const pairs: string[] = [];
  Array.from(params.keys())
    .sort()
    .forEach((key) => {
      const value = params.get(key) ?? '';
      pairs.push(`${key}=${value}`);
    });
  const dataCheckString = pairs.join('\n');

  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calc = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  const ok = crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash));
  if (!ok) throw new Error('Bad hash');

  const authDate = Number(params.get('auth_date') || '0');
  if (
    !authDate ||
    Math.abs(Math.floor(Date.now() / 1000) - authDate) > maxAgeSec
  ) {
    throw new Error('Auth date too old');
  }

  const out: Record<string, string> = {};
  params.forEach((value, key) => (out[key] = value));

  const result: ValidatedInit = { fields: out };
  if (out.user) {
    result.user = JSON.parse(out.user);
  }
  return result;
}
