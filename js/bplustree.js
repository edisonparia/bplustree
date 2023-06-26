tree = function (order) {
    // Privado
    this.root = new leaf(); // Nodo raíz del árbol
    this.maxkey = order - 1; // Máximo número de claves en un nodo
    this.minkyl = Math.floor(order / 2); // Mínimo número de claves en un nodo hoja
    this.minkyn = Math.floor(this.maxkey / 2); // Mínimo número de claves en un nodo interno
    this.leaf = null; // Nodo actual
    this.item = -1; // Índice de la clave actual
    // Público
    this.keyval = ''; // Valor de la clave actual
    this.recnum = -1; // Número de registro asociado a la clave actual
    this.length = 0; // Número de claves en el árbol
    this.eof = true; // Indica si se ha alcanzado el final del árbol
    this.found = false; // Indica si se encontró la clave al buscarla
};

tree.prototype.insert = function (key, rec) {
    var stack = []; // Pila para realizar inserciones y divisiones
    this.leaf = this.root;
    while (!this.leaf.isLeaf()) {
        stack.push(this.leaf);
        this.item = this.leaf.getItem(key);
        this.leaf = this.leaf.nodptr[this.item];
    }
    this.item = this.leaf.addKey(key, rec);
    this.keyval = key;
    this.eof = false;
    if (this.item === -1) {
        this.found = true;
        this.item = this.leaf.getItem(key, false);
        this.recnum = this.leaf.recnum[this.item];
    } else {
        this.found = false;
        this.recnum = rec;
        this.length++;
        if (this.leaf.keyval.length > this.maxkey) {
            var pL = this.leaf;
            var pR = this.leaf.split();
            var ky = pR.keyval[0];
            this.item = this.leaf.getItem(key, false);
            if (this.item === -1) {
                this.leaf = this.leaf.nextLf;
                this.item = this.leaf.getItem(key, false);
            }
            while (true) {
                if (stack.length === 0) {
                    var newN = new node();
                    newN.keyval[0] = ky;
                    newN.nodptr[0] = pL;
                    newN.nodptr[1] = pR;
                    this.root = newN;
                    break;
                }
                var nod = stack.pop();
                nod.addKey(ky, pL, pR);
                if (nod.keyval.length <= this.maxkey) break;
                pL = nod;
                pR = nod.split();
                ky = nod.keyval.pop();
            }
        }
    }
    return (!this.found);
};

tree.prototype.remove = function (key) {
    if (typeof key == 'undefined') {
        if (this.item === -1) {
            this.eof = true;
            this.found = false;
            return false;
        }
        key = this.leaf.keyval[this.item];
    }
    this._del(key);
    if (!this.found) {
        this.item = -1;
        this.eof = true;
        this.keyval = '';
        this.recnum = -1;
    } else {
        this.search(key, true);
        this.found = true;
    }
    return (this.found);
};

tree.prototype.search = function (key, near) {
    if (typeof near != 'boolean') near = false;
    this.leaf = this.root;
    while (!this.leaf.isLeaf()) {
        this.item = this.leaf.getItem(key);
        this.leaf = this.leaf.nodptr[this.item];
    }
    this.item = this.leaf.getItem(key, near);
    if (near && this.item == -1 && this.leaf.nextLf !== null) {
        this.leaf = this.leaf.nextLf;
        this.item = 0;
    }
    if (this.item === -1) {
        this.eof = true;
        this.keyval = '';
        this.found = false;
        this.recnum = -1;
    } else {
        this.eof = false;
        this.found = (this.leaf.keyval[this.item] === key);
        this.keyval = this.leaf.keyval[this.item];
        this.recnum = this.leaf.recnum[this.item];
    }
    return (!this.eof);
};

// ----- Métodos de eliminación -----

tree.prototype._del = function (key) {
    var stack = []; // Pila para realizar eliminaciones y divisiones
    var parNod = null; // Nodo padre
    var parPtr = -1; // Índice del nodo hijo en el nodo padre
    this.leaf = this.root;
    while (!this.leaf.isLeaf()) {
        stack.push(this.leaf);
        parNod = this.leaf;
        parPtr = this.leaf.getItem(key);
        this.leaf = this.leaf.nodptr[parPtr];
    }
    this.item = this.leaf.getItem(key, false);

    // La clave no está en el árbol
    if (this.item === -1) {
        this.found = false;
        return;
    }
    this.found = true;

    // Eliminar la clave del nodo hoja
    for (var i = this.item, len = this.leaf.keyval.length - 1; i < len; i++) {
        this.leaf.keyval[i] = this.leaf.keyval[i + 1];
        this.leaf.recnum[i] = this.leaf.recnum[i + 1];
    }
    this.leaf.keyval.pop();
    this.leaf.recnum.pop();
    this.length--;
};
