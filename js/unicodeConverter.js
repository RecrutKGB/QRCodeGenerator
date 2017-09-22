/*
Библиотека конвертера из Unicode в utf-8 и обратно.
Результат выдаётся в виде строки в HEX формате.
 */

const NEXT_BYTE = { prefix: 0x80, mask: 0x3F };
const TWO_BYTE = { prefix: 0xC0, mask: 0x1F };
const THREE_BYTE = { prefix: 0xE0, mask: 0xF };
const FOUR_BYTE = { prefix: 0xF0, mask: 0x7 };

function utf8ToUnicode(sym) {
    var result;

    // Определяем количество байт
    var test = sym;

    while ((test & NEXT_BYTE.mask) === NEXT_BYTE.prefix) { test = test >>> 8; }    // Выбираем первый байт

    switch (true) {
        case ((test & 0x80) === 0):
            // Первый бит пуст, значит это однобайтовый utf-8, он же ASCII
            result = sym;
            break;
        case ((test & (0xFF ^ TWO_BYTE.mask)) === TWO_BYTE.prefix):
            // Двухбайтовый utf-8
            result = ((sym >>> 8) & TWO_BYTE.mask) << 6;
            result |= sym & NEXT_BYTE.mask;
            break;
        case ((test & (0xFF ^ THREE_BYTE.mask)) === THREE_BYTE.prefix):
            // Трёхбайтовый utf-8
            result = ((sym >>> 16) & THREE_BYTE.mask) << 12;
            result |= ((sym >>> 8) & NEXT_BYTE.mask) << 6;
            result |= sym & NEXT_BYTE.mask;
            break;
        case ((test & (0xFF ^ FOUR_BYTE.mask)) === FOUR_BYTE.prefix):
            // Четырёхбайтовый utf-8
            result = ((sym >>> 24) & FOUR_BYTE.mask) << 18;
            result |= ((sym >>> 16) & NEXT_BYTE.mask) << 12;
            result |= ((sym >>> 8) & NEXT_BYTE.mask) << 6;
            result |= sym & NEXT_BYTE.mask;
            break;
        default:
            error('UnicodeConverter.js','utf8ToUnicode()','Это не utf-8!');
            return undefined;
    }
    return result;
}

function unicodeToUtf8(sym) {
    var result;
    switch (0) {
        case (sym >>> 7):
            // У нас ASCII, один байт в utf-8
            result = sym;
            break;
        case (sym >>> 11):
            // Пришло 11 бит на 2 байта utf-8
            result = ((sym >>> 6) | TWO_BYTE.prefix) << 8;
            result |= (sym & NEXT_BYTE.mask) | NEXT_BYTE.prefix;
            break;
        case (sym >>> 16):
            // Пришло 16 бит на 3 байта utf-8
            result = ((sym >>> 12) | THREE_BYTE.prefix) << 16;
            result |= (((sym >>> 6) & NEXT_BYTE.mask) | NEXT_BYTE.prefix) << 8;
            result |= (sym & NEXT_BYTE.mask) | NEXT_BYTE.prefix;
            break;
        case (sym >>> 21):
            // Пришло 21 бит на 4 байта utf-8
            result = ((sym >>> 18) | FOUR_BYTE.prefix) << 24;
            result |= (((sym >>> 12) & NEXT_BYTE.mask) | NEXT_BYTE.prefix) << 16;
            result |= (((sym >>> 6) & NEXT_BYTE.mask) | NEXT_BYTE.prefix) << 8;
            result |= (sym & NEXT_BYTE.mask) | NEXT_BYTE.prefix;
            break;
        default:
            error('UnicodeConverter.js','unicodeToUtf8()','Что-то число крупное попалось!');
            return undefined;
    }
    return result;
}