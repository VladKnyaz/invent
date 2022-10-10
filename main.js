'use strict';
var cells = [
  // ПОЛУЧАЕМ ИЗ БАЗЫ ДАННЫХ
  { id: 1, idItem: null, isFull: false, type: null, value: null },
  { id: 2, idItem: 1, isFull: true, type: 'clothes', value: null },
  { id: 3, idItem: 4, isFull: true, type: 'bullets', value: 50 },
  { id: 4, idItem: 3, isFull: true, type: 'weapon', value: null },
  { id: 5, idItem: 5, isFull: true, type: 'bullets', value: 64 }, // Не правильный id предмета
];
window.onerror = function (msg, url, line) {
  console.log(`${msg} at ${url} line ${line.toString()}`);
};
let allItems = [
  { id: 1, name: 'Футболка от гучи', srcImg: 'img/t-shirt.svg', type: 'clothes' },
  { id: 2, name: 'Футболка от Влада', srcImg: 'img/t-shirt.svg', type: 'clothes' },
  {
    id: 3,
    name: 'Пистолет пулемёт',
    srcImg: 'img/weapon.svg',
    type: 'weapon',
    idWeapon: 'weapon_machinepistol',
  },
  { id: 4, name: 'Патроны 0.5мм', srcImg: 'img/bullets.svg', type: 'bullets' },
  { id: 5, name: 'Патроны 1мм', srcImg: 'img/bullets.svg', type: 'bullets' },
];
var UserCells = [];
// var cells = [];

// function setCellsAndItems(userCell, items) {
//   allItems = items;
//   UserCells = userCell;
//   cells = Array.from({ length: 10 }, (_, i) => {
//     if (!UserCells[i]) return { id: i + 1, type: null, value: null, idItem: null, isFull: false };
//     return UserCells[i];
//   });
//   startInventory();
// }

const inventory = document.querySelector('.inventory');

  cells.map((cell) => {
    let div = document.createElement('div');
    div.className = 'cell';
    div.dataset.cellid = cell.id;

    if (cell.idItem > allItems.length) {
      // Если администратор ошибся с id предмета и такого нет, то ничего не будет
      // Запрос в базу данных на изменение сломаной ячейки
      cells[cell.id - 1] = { id: cell.id, idItem: null, isFull: false, type: null, value: null }; // Решение для фейк базы данных
      return inventory.append(div);
    }
    if (cell.isFull) {
      let itemInfo = allItems[cell.idItem - 1];

      if (cell.type !== 'bullets') {
        div.innerHTML = `
        <div class="item" data-cellId=${cell.id} data-itemId=${itemInfo.id}>
            <img draggable="false" src="${itemInfo.srcImg}" alt="" class="img" />
            <div class="name">${itemInfo.name}</div>
        </div>
      `;
      } else if (cell.type === 'bullets') {
        div.innerHTML = `
        <div class="item" data-cellId=${cell.id} data-itemId=${itemInfo.id}>
            <img draggable="false" src="${itemInfo.srcImg}" alt="" class="img" />
            <div class="name">Патроны ${itemInfo.typeBullets}мм</div>
        </div>
      `;
        let itemDiv = div.querySelector('.item');
        itemDiv = $(itemDiv);
        itemDiv.after(`<span class='numbers' draggable="false">${cell.value}</span>`);
      }
    }

    inventory.append(div);
  });

  let items = document.querySelectorAll('.item');
  let cellsDiv = document.querySelectorAll('.cell');

  var dragObject = {};
  items.forEach((item) => {
    // ФУНКЦИИ
    item.ondragstart = function () {
      return false;
    };
    function createAvatar(e) {
      // запомнить старые свойства, чтобы вернуться к ним при отмене переноса
      var avatar = dragObject.elem;
      var old = {
        parent: avatar.parentNode,
        position: avatar.position || '',
        left: avatar.left || '',
        top: avatar.top || '',
        zIndex: avatar.zIndex || '',
      };

      // функция для отмены переноса
      avatar.rollback = function () {
        old.parent.insertBefore(avatar, old.nextSibling);
        if (dragObject.nextSibling) {
          old.parent.append(dragObject.nextSibling);
        }
        avatar.style.position = old.position;
        avatar.style.left = old.left;
        avatar.style.top = old.top;
        avatar.style.zIndex = old.zIndex;
      };
      avatar.old = old;

      return avatar;
    }

    function getCoords(elem) {
      // кроме IE8-
      var box = elem.getBoundingClientRect();

      return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset,
      };
    }

    function startDrag(e) {
      var avatar = dragObject.avatar;

      // инициировать начало переноса
      document.body.appendChild(avatar);
      avatar.style.zIndex = 999;
      avatar.style.position = 'absolute';
    }

    // -------------------------------------------------------------------------------------------------
    // возвратит ближайший droppable или null
    function findDroppable(event) {
      // спрячем переносимый элемент
      dragObject.avatar.style.visibility = 'hidden';

      var elem = document.elementFromPoint(event.clientX, event.clientY); // Самый глубокий элемент под курсором

      // показать переносимый элемент обратно
      dragObject.avatar.style.visibility = 'visible';

      if (elem == null) {
        // такое возможно, если курсор мыши "вылетел" за границу окна
        return null;
      }

      return elem.closest('.cell');
    }

    function finishDrag(e) {
      var dropElem = findDroppable(e);

      if (dropElem) {
        var avatar = dragObject.avatar;

        let newCell = cells[dropElem.dataset.cellid - 1];
        let oldCell = cells[avatar.dataset.cellid - 1];

        let zeroObj = { id: oldCell.id, idItem: null, isFull: false, type: null, value: null };

        // Если занято то ничего не будет предмет возвращается обратно на место
        if (newCell.isFull) {
          let parentDragObject = dragObject.avatar.old.parent;
          if (parentDragObject == dropElem) return dragObject.avatar.rollback();
          if (newCell.type === oldCell.type) return dragObject.avatar.rollback();

          // Меняем местамит данные ячеек
          cells[oldCell.id - 1] = {
            id: oldCell.id,
            idItem: newCell.idItem,
            isFull: newCell.isFull,
            type: newCell.type,
            value: newCell.value,
          };
          cells[newCell.id - 1] = {
            id: newCell.id,
            idItem: oldCell.idItem,
            isFull: oldCell.isFull,
            type: oldCell.type,
            value: oldCell.value,
          };
          // Меняем местамит данные ячеек

          if (dropElem.children.length > 1) {
            // чекаем наведеный
            dropElem.children[0].dataset.cellid = parentDragObject.dataset.cellid;
            parentDragObject.append(dropElem.children[0], dropElem.children[1]); // старый элемент
            avatar.dataset.cellid = dropElem.dataset.cellid;
            dropElem.append(avatar); // на который наводимся
            avatar.style = '';
            return;
          }
          if (dragObject.nextSibling) {
            // чекаем старый
            dropElem.children[0].dataset.cellid = parentDragObject.dataset.cellid;
            parentDragObject.append(dropElem.children[0]);
            avatar.dataset.cellid = dropElem.dataset.cellid;
            dropElem.append(avatar, dragObject.nextSibling); // на который наводимся
            avatar.style = '';
            return;
          }

          dropElem.children[0].dataset.cellid = parentDragObject.dataset.cellid;
          parentDragObject.append(dropElem.children[0]); // старый элемент
          avatar.dataset.cellid = dropElem.dataset.cellid;
          dropElem.append(avatar); // на который наводимся

          avatar.style = '';

          return;
        }

        if (oldCell.type === 'bullets') {
          cells[dropElem.dataset.cellid - 1] = {
            id: newCell.id,
            idItem: parseInt(avatar.dataset.itemid),
            isFull: true,
            type: 'bullets',
            value: oldCell.value,
          };
        }

        cells[dropElem.dataset.cellid - 1] = {
          id: newCell.id,
          idItem: parseInt(avatar.dataset.itemid),
          isFull: true,
          type: oldCell.type,
          value: oldCell.value,
        };

        // ОБНУЛЯЕМ СТИЛИ
        avatar.style = '';
        // ОБНУЛЯЕМ СТИЛИ

        cells[avatar.dataset.cellid - 1] = zeroObj; // Обнуляем старую ячейку

        avatar.dataset.cellid = dropElem.dataset.cellid; // Ставим id новой ячейки в item

        dropElem.appendChild(avatar);
        if (dragObject.nextSibling) {
          dropElem.appendChild(dragObject.nextSibling);
        }
      } else {
        dragObject.avatar.rollback();
      }
    }
    // -------------------------------------------------------------------------------------------------

    // КОНЕЦ ФУНКЦИЙ

    document.onmousedown = function (e) {
      if (e.button != 0) {
        // если клик правой кнопкой мыши
        return; // то он не запускает перенос
      }

      var elem = e.target.closest('.item');
      if (!elem) return; // не нашли, клик вне draggable-объекта

      // запомнить переносимый объект
      dragObject.elem = elem;

      // запомнить координаты, с которых начат перенос объекта
      dragObject.downX = e.pageX;
      dragObject.downY = e.pageY;
    };

    document.onmousemove = function (e) {
      if (!dragObject.elem) return; // элемент не зажат

      if (!dragObject.avatar) {
        // посчитать дистанцию, на которую переместился курсор мыши
        var moveX = e.pageX - dragObject.downX;
        var moveY = e.pageY - dragObject.downY;

        if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
          return; // ничего не делать, мышь не передвинулась достаточно далеко
        }

        if (dragObject.elem.nextSibling && !dragObject.elem.nextSibling.length) {
          dragObject.nextSibling = dragObject.elem.nextSibling;
          dragObject.elem.nextSibling.remove();
        }

        dragObject.avatar = createAvatar(e); // захватить элемент
        if (!dragObject.avatar || !dragObject.avatar.dataset.itemid) {
          dragObject = {}; // аватар создать не удалось, отмена переноса
          return; // возможно, нельзя захватить за эту часть элемента
        }
        // аватар создан успешно

        // Проверка на тип предмета

        if (dragObject.avatar.dataset.itemid) {
          let cell = cells[dragObject.avatar.dataset.cellid - 1];
          dragObject.cell = cell;

          if (cell.type === 'bullets') {
            dragObject.bullets = {
              value: cell.value,
              typeBullets: cell.typeBullets,
            };
          }
        }

        // Конец проверки

        // создать вспомогательные свойства shiftX/shiftY
        var coords = getCoords(dragObject.avatar);
        dragObject.shiftX = dragObject.downX - coords.left;
        dragObject.shiftY = dragObject.downY - coords.top;

        startDrag(e);
      }
      // отобразить перенос объекта при каждом движении мыши
      dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
      dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';
    };

    document.onmouseup = function (e) {
      // (1) обработать перенос, если он идёт
      if (dragObject.avatar) {
        finishDrag(e);
      }

      dragObject = {};
    };
  });

