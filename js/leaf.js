// Definición de la clase 'leaf'
leaf = function () {
    // Propiedades del nodo hoja
    this.keyval = [];   // Almacena las claves
    this.recnum = [];   // Almacena los números de registro
    this.prevLf = null; // Referencia al nodo hoja anterior
    this.nextLf = null; // Referencia al nodo hoja siguiente
};

// Devuelve 'true' para indicar que el nodo actual es una hoja
leaf.prototype.isLeaf = function () {
    return true;
};

// Busca una clave en el nodo hoja
leaf.prototype.getItem = function (key, near) {
    var vals = this.keyval;

    if (near) {
        // Si 'near' es verdadero, encuentra la posición de la clave que es mayor o igual a la clave dada
        for (var i = 0, len = vals.length; i < len; i++) {
            if (key <= vals[i]) return i;
        }
    } else {
        // Si 'near' es falso, encuentra la posición de la clave exacta si existe
        for (var i = 0, len = vals.length; i < len; i++) {
            if (key === vals[i]) return i;
        }
    }
    // Si la clave no se encuentra, devuelve -1
    return -1;
};

// Versión mejorada de 'getItem' que utiliza búsqueda binaria
leaf.prototype.XgetItem = function (key, near) {
    var vals = this.keyval;
    var L = 0, M, R = vals.length - 1;

    if (key > vals[R])
        return -1;
    else if (key <= vals[L])
        M = 0;
    else {
        while (true) {
            M = Math.floor((R - L) / 2);

            if (M === 0) {
                M = R;
                break;
            }

            M += L;

            if (key === vals[M]) break;
            if (vals[M] > key) R = M;
            else L = M;
        }
    }

    if (vals[M] != key && !near) return -1;
    return M;
};

// Agrega una clave y su número de registro al nodo hoja
leaf.prototype.addKey = function (key, rec) {
    var vals = this.keyval;
    var itm = vals.length;

    for (var i = 0, len = itm; i < len; i++) {
        if (key === vals[i]) {
            itm = -1;
            break;
        }
        if (key <= vals[i]) {
            itm = i;
            break;
        }
    }

    if (itm != -1) {
        // Desplaza los elementos para hacer espacio para la nueva clave y número de registro
        for (var i = vals.length; i > itm; i--) {
            vals[i] = vals[i - 1];
            this.recnum[i] = this.recnum[i - 1];
        }

        // Inserta la nueva clave y número de registro en las posiciones correspondientes
        vals[itm] = key;
        this.recnum[itm] = rec;
    }

    return itm;
};

// Divide el nodo hoja en dos nodos hoja separados
leaf.prototype.split = function () {
    var mov = Math.floor(this.keyval.length / 2);
    var newL = new leaf();

    // Mueve la mitad de las claves y números de registro al nuevo nodo hoja
    for (var i = mov - 1; i >= 0; i--) {
        newL.keyval[i] = this.keyval.pop();
        newL.recnum[i] = this.recnum.pop();
    }

    // Actualiza las referencias al nodo anterior y siguiente
    newL.prevLf = this;
    newL.nextLf = this.nextLf;

    if (this.nextLf !== null) this.nextLf.prevLf = newL;
    this.nextLf = newL;

    return newL;
};

// Fusiona el nodo hoja actual con otro nodo hoja
leaf.prototype.merge = function (frNod, paNod, frKey) {
    // Agrega las claves y números de registro del nodo hoja 'frNod' al nodo hoja actual
    for (var i = 0, len = frNod.keyval.length; i < len; i++) {
        this.keyval.push(frNod.keyval[i]);
        this.recnum.push(frNod.recnum[i]);
    }

    // Actualiza las referencias al siguiente nodo hoja
    this.nextLf = frNod.nextLf;
    if (frNod.nextLf !== null) frNod.nextLf.prevLf = this;

    frNod.prevLf = null;
    frNod.nextLf = null;

    var itm = paNod.keyval.length - 1;

    // Actualiza las claves y referencias en el nodo padre
    for (var i = itm; i >= 0; i--) {
        if (paNod.keyval[i] == frKey) {
            itm = i;
            break;
        }
    }

    for (var i = itm, len = paNod.keyval.length - 1; i < len; i++) {
        paNod.keyval[i] = paNod.keyval[i + 1];
        paNod.nodptr[i + 1] = paNod.nodptr[i + 2];
    }

    paNod.keyval.pop();
    paNod.nodptr.pop();
};

