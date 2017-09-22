var Element = {
    // Устанавливает элементу атрибуты полученные в списке формата JSON
    // { 'name': 'elementName', 'id': 'elementId', 'class': 'elementClass' }
    setAttributes: function (element, attributes) {
        for (var attribute in attributes) {
            element.setAttribute(attribute, attributes[attribute]);
        }
    },
    // Создаёт новый элемент elementName и присваевает ему атрибуты
    // полученные в списке формата JSON
    // { 'name': 'elementName', 'id': 'elementId', 'class': 'elementClass' }
    createElement: function (elementName, attributes) {
        var newElement = document.createElement(elementName);
        this.setAttributes(newElement, attributes);
        return newElement;
    }
}
