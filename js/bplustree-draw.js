/*
  B+ Tree display using Canvas
*/

// Variable global para almacenar el HTML del árbol
var treeHTML;

// Verificar si el navegador admite el elemento canvas
var useCanvas = !!document.createElement('canvas').getContext;

// Método para mostrar el árbol B+
tree.prototype.show = function (canvasId) {
  treeHTML = '\r\nfound: ' + this.found.toString().toUpperCase() + '&nbsp;&nbsp;&nbsp;&nbsp;eof: ' + this.eof.toString().toUpperCase() + '\r\n';

  // Mostrar mensaje especial si el árbol es muy grande
  if (this.length > maxDisplay) {
    treeHTML += '<br><br>\r\n' + 'Tree is very big (' + commas(this.length) + ' keys).';
    if (!this.eof) treeHTML += ' Current key: ' + this.leaf.keyval[this.item];
    treeHTML += '<br>\r\n';
    this.showoff(canvasId);
    return treeHTML;
  }

  // Mostrar el árbol utilizando canvas o en modo lista
  if (useCanvas) {
    this.drawInit(canvasId);
    this.drawNode(this.root, 0);
  } else {
    this.listNode(this.root, 0);
  }

  return treeHTML;
};

// Mostrar el árbol en modo lista para navegadores antiguos
tree.prototype.listNode = function (ptr, lvl) {
  treeHTML += '<div class="trLvl" style="padding-left:' + (lvl * 40) + 'px;"><table class="';
  if (ptr.isLeaf()) treeHTML += 'trLeaf';
  else treeHTML += 'trNode';
  treeHTML += '"><tbody><tr>';

  // Recorrer los valores clave de los nodos y mostrarlos en la tabla
  for (var i = 0, len = this.maxkey; i < len; i++) {
    if (ptr == this.leaf && i == this.item) treeHTML += '<td class="here">';
    else treeHTML += '<td>';
    if (i < ptr.keyval.length) treeHTML += ptr.keyval[i] + '</td>';
    else treeHTML += '&nbsp;</td>';
  }
  treeHTML += '</tr></tbody></table></div>\r\n';

  // Si el nodo es una hoja, se detiene la recursión
  if (ptr.isLeaf()) return;

  // Recorrer los punteros a nodos hijos y mostrarlos
  for (var i = 0, len = ptr.keyval.length; i <= len; i++) {
    this.listNode(ptr.nodptr[i], lvl + 1);
  }
};

// Inicializar el dibujo del árbol utilizando canvas
tree.prototype.drawInit = function (cId) {
  // Canvas
  this.canvas = getElementByIdOrName(cId);
  this.context = this.canvas.getContext('2d');

  
  this.Nfill = '#C2EABD'; // Color de relleno de nodos no hoja
  this.Nline = '#5E8C61'; // Color de borde de nodos no hoja
  this.Pfill = '#F2A48C'; // Color de relleno de punteros
  this.Pline = '#8C4B39'; // Color de borde de punteros
  this.Lfill = '#FFFFB3'; // Color de relleno de nodos hoja
  this.Lline = '#D9D973'; // Color de borde de nodos hoja
  this.Cfill = '#FFCCCC'; // Color de relleno del nodo actual
  this.Cline = '#FF0000'; // Color de borde del nodo actual
  this.Tline = '#000000'; // Color de texto
  // Posiciones y tamaños
  this.Tfont = '15px arial';
  this.Tsize = 15;
  this.curLeft = 0;
  this.vPad = this.maxkey * 10;
  this.hPad = 15;

  var d = 0,
    w = 0;
  var ptr = this.root;

  // Calcular la profundidad máxima del árbol
  while (!ptr.isLeaf()) {
    ptr = ptr.nodptr[0];
    d++;
  }

  // Calcular el ancho total del árbol
  this.context.font = this.Tfont;
  while (true) {
    for (var i = 0, len = ptr.keyval.length; i < len; i++) {
      w += this.context.measureText(ptr.keyval[i]).width + 4;
    }
    w += ((this.maxkey - ptr.keyval.length) * 9) + 1;

    if (ptr.nextLf === null) break;
    ptr = ptr.nextLf;
    w += this.hPad;
  }

  // Preparar el canvas
  this.canvas.width = w;
  this.canvas.height = this.ypos(d) + this.Tsize + 20;
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.font = this.Tfont;
  this.context.lineWidth = 1;
  this.context.strokeStyle = this.Pline;
};

// Calcular la posición vertical de un nivel en el árbol
tree.prototype.ypos = function (lvl) {
  var oneRow = this.Tsize + 13 + this.vPad;
  return (10 + (lvl * oneRow));
};

// Dibujar un nodo en el canvas
tree.prototype.drawNode = function (ptr, lvl) {
  var ret = [];
  var y = this.ypos(lvl);

  if (ptr.isLeaf()) {
    ret[0] = this.curLeft;
    ret[1] = this.drawLeaf(ptr, y);
    return ret;
  }

  var KL = [],
    KR = [];

  for (var i = 0, len = ptr.nodptr.length; i < len; i++) {
    ret = this.drawNode(ptr.nodptr[i], lvl + 1);
    KL[i] = ret[0];
    KR[i] = ret[1];
  }

  var cA = this.context;
  var h = this.Tsize;
  var x, p, xb, yb, w = 0;

  for (var i = 0, len = ptr.keyval.length; i < len; i++) {
    w += cA.measureText(ptr.keyval[i]).width + 4;
  }
  w += ((this.maxkey - ptr.keyval.length) * 10) + 1;
  x = Math.floor((KR[KR.length - 1] - KL[0] - w) / 2) + KL[0];
  ret[0] = x;
  ret[1] = x + w;

  yb = this.ypos(lvl + 1);
  cA.beginPath();

  for (var i = 0, len = this.maxkey + 1; i < len; i++) {
    w = (i >= ptr.keyval.length) ? 6 : cA.measureText(ptr.keyval[i]).width;

    cA.fillStyle = this.Nline;
    if (i < this.maxkey)
      cA.fillRect(x, y, w + 5, h + 13);
    else
      cA.fillRect(x, y + h + 5, w + 5, 8);

    cA.fillStyle = this.Nfill;
    if (i < this.maxkey)
      cA.fillRect(x + 1, y + 1, w + 3, h + 4);
    cA.fillRect(x + 1, y + h + 6, w + 3, 6);

    if (i < ptr.keyval.length) {
      cA.fillStyle = this.Tline;
      cA.fillText(ptr.keyval[i], x + 2, y + h + 2);
    }

    if (i < ptr.nodptr.length) {
      cA.fillStyle = this.Pfill;
      p = Math.floor((w - 4) / 2);
      cA.fillRect(x + p + 2, y + h + 8, 4, 4);
      xb = Math.floor((KR[i] - KL[i]) / 2) + KL[i];
      cA.moveTo(x + p + 4, y + h + 13);
      cA.lineTo(xb, yb);
    }

    x += w + 4;
  }

  cA.stroke();
  return ret;
};

// Dibujar un nodo hoja en el canvas
tree.prototype.drawLeaf = function (ptr, y) {
  var cA = this.context;
  var x = this.curLeft;
  var h = this.Tsize;
  var w;
  var sx = -1;

  for (var i = 0, len = this.maxkey; i < len; i++) {
    if (ptr !== null && ptr == this.leaf && i == this.item) sx = x;
    w = (i >= ptr.keyval.length) ? 5 : cA.measureText(ptr.keyval[i]).width;

    cA.fillStyle = this.Lline;
    cA.fillRect(x, y, w + 5, h + 10);

    cA.fillStyle = this.Lfill;
    cA.fillRect(x + 1, y + 1, w + 3, h + 8);

    x += w + 4;
  }

  if (sx != -1) {
    w = cA.measureText(ptr.keyval[this.item]).width;

    cA.fillStyle = this.Cline;
    cA.fillRect(sx, y, w + 5, h + 10);

    cA.fillStyle = this.Cfill;
    cA.fillRect(sx + 1, y + 1, w + 3, h + 8);
  }

  cA.fillStyle = this.Tline;
  sx = this.curLeft;

  for (var i = 0, len = ptr.keyval.length; i < len; i++) {
    w = cA.measureText(ptr.keyval[i]).width;
    cA.fillText(ptr.keyval[i], sx + 2, y + h + 4);
    sx += w + 4;
  }

  this.curLeft = x + this.hPad;
  return x;
};
