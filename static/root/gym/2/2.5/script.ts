// @process
export {};

// Функция: formatPhone(input: string): string
// Должна принимать любой ввод и возвращать отформатированный телефон

// Примеры:
// '1234567890' → '+1 (234) 567-8901'
// '12345' → '+1 (234) 5'
// 'abc123def456' → '+1 (234) 56' (убрать нечисловые символы)

function formatPhone(input: string): string {
  // Убираем все нечисловые символы
  const digits = input.replace(/\D/g, '');

  // Форматируем регуляркой с группами
  return digits.replace(
    /^(\d{1})(\d{0,3})(\d{0,3})(\d{0,4}).*/,
    (match, g1, g2, g3, g4) => {
      let result = '+' + g1;
      if (g2) result += ' (' + g2;
      if (g2.length === 3) result += ')';
      if (g3) result += ' ' + g3;
      if (g4) result += '-' + g4;
      return result;
    },
  );
}

// (document.querySelector('input') as HTMLInputElement)?.addEventListener(
//   'input',
//   (e: any) => {
//     e.currentTarget.value = formatPhone(e.currentTarget.value);
//   },
// );

(document.querySelector('input') as HTMLInputElement)?.addEventListener(
  'input',
  (e: any) => {
    const input = e.currentTarget;
    const oldValue = input.value;
    const oldCursorPos = input.selectionStart || 0;

    // Считаем сколько цифр было до курсора
    const digitsBeforeCursor = oldValue
      .slice(0, oldCursorPos)
      .replace(/\D/g, '').length;

    // Форматируем
    const newValue = formatPhone(oldValue);
    input.value = newValue;

    // Находим новую позицию курсора (где будет то же количество цифр)
    let newCursorPos = 0;
    let digitCount = 0;
    for (let i = 0; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        digitCount++;
        if (digitCount === digitsBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }
    }

    // Если все цифры прошли, ставим в конец
    if (digitCount < digitsBeforeCursor) {
      newCursorPos = newValue.length;
    }

    // Восстанавливаем курсор
    input.setSelectionRange(newCursorPos, newCursorPos);
  },
);
