function QR() {         // Прототип класса штрихкода
    this.type = undefined;
    this.levelCorrection = undefined;
    this.symbols = undefined;
    this.data = undefined;
    this.version = undefined;
    this.svg = undefined;
    // Добавляем данные
    this.pushData = function (newData, lenght) {
        // Если переданая строка короче необходимой
        while (newData.length < lenght) {
            this.data.concat("0");       // Добиваем нулями
            lenght--;
        }
        this.data.concat(newData);
    };
    // Строим префикс типа
    this.getTypePrefix = function () {
        return (this.type === 0) ? 1 : ((this.type === 1) ? 2 : 4);
    };
    // Получаем длину поля для количества cимволов
    this.getSymbolsPrefixLenght = function (levelCode) {
        switch (true) {
            case (levelCode < 10):
                return dataLenghtField[0][this.type];
            case (levelCode < 27):
                return dataLenghtField[1][this.type];
            case (levelCode < 40):
                return dataLenghtField[2][this.type];
            default:
                error('QRGenerator.js', 'QR.getSymbolsPrefixLenght()', 'Не найден уровень.');
                return;
        }
    };
    // Строим префикс количества символов
    this.getSymbolsPrefix = function () {
        var len = this.getSymbolsPrefixLenght(this.version);
        var sym = this.symbols.toString(2);
        while (sym.length < len) {
            sym = "0" + sym;
        }
        return sym;
    };
    this.getVersion = function () {
        // Проверяем что поля с которыми мы работаем не пусты
        if (this.type === undefined) {
            error('QRGenerator.js', 'QR.getVersion()', 'Не указан тип кода.');
            return;
        } else if (this.data === undefined) {
            error('QRGenerator.js', 'QR.getVersion()', 'Нет данных.');
            return;
        } else if (this.symbols === undefined) {
            error('QRGenerator.js', 'QR.getVersion()', 'Не указано количество символов.');
            return;
        }
        // Ищем подходящую версию (должны поместится все данные + 4 бита типа + минимум
        // 8 бит поля количества символов
        for (var count = 0; count < 40; count++) {
            if (totalBits[count][this.levelCorrection] >= this.data.length+12) { break; }
        }
        // Контрольная проверка с учётом настоящей длины поля количесва символов
        if (totalBits[count][this.levelCorrection] < this.data.length + this.getSymbolsPrefixLenght(count) + 4) {
            if ((++count) > 39) {
                errorLabel('Слишком много символов.');
                return;
            }
        }
        // Сохраняем выбранную версию
        this.version = count;
        // Дописываем префикс
        this.data = this.getTypePrefix().concat(this.getSymbolsPrefix()).concat(this.data);
        // Ровняем по байтам
        while ((this.data.length % 8) !== 0) {
            this.pushData("0", 1);
        }
    };
    this.clear = function () {
        this.type = undefined;
        this.levelCorrection = undefined;
        this.data = undefined;
        this.version = undefined;
        this.svg = undefined;
    }
}

var newQR = new QR();   // Создаём экземпляр класса

function errorLabel(errorMessage) {
    document.getElementById('errorLabel').innerText = errorMessage;
}

function clearErrorLabel() {
    document.getElementById('errorLabel').innerText = "";
}
function GetNewQRCode() {
    var textFromCode = document.getElementById("textFromCode").value;

    // Проверяем что пользователь что-то ввёл
    if (textFromCode.length === 0) {
        errorLabel('Сначала надо что-то ввести!');
        return;
    }
    // Записываем количество символов
    newQR.symbols = textFromCode.length;

    // Смотрим какой тип кода выбран
    switch (newQR.type) {
        case 0:     // Выбран цифровой тип кода
            if (textFromCode.search(/\D/) !== -1) {      // Проверим что введены только цифры
                errorLabel('Должны быть только цифры!');
                return;
            }
            // Переводим строку в массив данных в двоичном представлении
            for (var count = 0; count < textFromCode.length-3; count += 3) {
                // Выбираем по 3 символа, преобразуем в число и записываем в двоичном 10 битном представлении
                newQR.pushData(parseInt(textFromCode.substr(count, 3)).toString(2), 10);
            }
            // Дозаписываем остатки
            switch (textFromCode.length - count) {
                case 2:
                    newQR.pushData(parseInt(textFromCode.substr(count, 2)).toString(2), 7);
                    break;
                case 1:
                    newQR.pushData(parseInt(textFromCode.substr(count, 1)).toString(2), 4);
                    break;
                case 0:
                    break;
                default:
                    error('QRGenerator.js', 'GetNewQRCode()', 'Что-то с циклом намудрил. QR.type = digit');
                    return;
            }
            // Осуществляем подбор версии QR
            newQR.getVersion();


            break;
        case 1:
            break;
        case 2:
            break;
        default:
            error('QRGenerator.js', 'GetNewQRCode()', 'Ошибка выбора типа кода.');
            return;
    }
}

function SaveAsFile() {
    alert('utf-8: 11100000 10110011 10001100 to Unicode: ' + utf8ToUnicode(parseInt('111000001011001110001100',2)).toString(2));
}

function changeRadioType() {    // Пользователь сменил тип данных
    switch (document.querySelector('input[name="typeOfCode"]:checked').value) {
        case 'digit':
            newQR.type = 0;
            break;
        case 'letterDigit':
            newQR.type = 1;
            break;
        case 'byte':
            newQR.type = 2;
            break;
        default:
            error('QRGenerator.js', 'changeRadioType()', 'Ошибка выбора типа кода.');
    }
}

function changeRadioLevelCorrection() {    // Пользователь изменил уровень коррекции
    switch (document.querySelector('input[name="levelCorrection"]:checked').value) {
        case 'L':
            newQR.levelCorrection = 0;
            break;
        case 'M':
            newQR.levelCorrection = 1;
            break;
        case 'Q':
            newQR.levelCorrection = 2;
            break;
        case 'H':
            newQR.levelCorrection = 3;
            break;
        default:
            alert ('Ошибка выбора уровня коррекции.');
    }
}