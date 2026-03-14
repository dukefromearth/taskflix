const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const BASE = ALPHABET.length;

const charToInt = (char: string): number => ALPHABET.indexOf(char);
const intToChar = (index: number): string => ALPHABET[index] ?? '0';

const pad = (key: string, len: number): string => key.padEnd(len, '0');

export const generateInitialOrderKey = (): string => 'h';

export const generateOrderKeyBetween = (left?: string, right?: string): string => {
  if (!left && !right) {
    return generateInitialOrderKey();
  }

  if (!left) {
    return `0${right}`;
  }

  if (!right) {
    return `${left}z`;
  }

  let a = left;
  let b = right;
  let length = Math.max(a.length, b.length);

  while (true) {
    a = pad(a, length);
    b = pad(b, length);

    const leftDigits = a.split('').map(charToInt);
    const rightDigits = b.split('').map(charToInt);

    let carry = 0;
    const sum: number[] = new Array(length).fill(0);

    for (let i = length - 1; i >= 0; i -= 1) {
      const digitSum = (leftDigits[i] ?? 0) + (rightDigits[i] ?? 0) + carry;
      sum[i] = digitSum % BASE;
      carry = Math.floor(digitSum / BASE);
    }

    const midpoint: number[] = new Array(length).fill(0);
    let remainder = carry;

    for (let i = 0; i < length; i += 1) {
      const current = remainder * BASE + (sum[i] ?? 0);
      midpoint[i] = Math.floor(current / 2);
      remainder = current % 2;
    }

    const mid = midpoint.map(intToChar).join('').replace(/0+$/, '');

    if (!mid || mid <= left || mid >= right) {
      length += 1;
      continue;
    }

    return mid;
  }
};
