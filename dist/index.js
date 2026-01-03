var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ProductAPI {
    constructor() {
        this.baseUrl = "http://localhost:3000/products";
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(this.baseUrl);
            if (!res.ok)
                throw new Error("Failed to fetch products");
            return res.json();
        });
    }
    create(product) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!product.id) {
                product.id = Math.random().toString(36).substr(2, 9);
            }
            const res = yield fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });
            if (!res.ok)
                throw new Error("Failed to create product");
            return res.json();
        });
    }
    update(id, product) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${this.baseUrl}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product),
            });
            if (!res.ok)
                throw new Error("Failed to update product");
            return res.json();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
            if (!res.ok)
                throw new Error("Failed to delete product");
        });
    }
}
class DomInputs {
    constructor() {
        this.title = document.getElementById("title");
        this.price = document.getElementById("price");
        this.category = document.getElementById("category");
        this.total = document.getElementById("total");
    }
    read() {
        return {
            id: "",
            title: this.title.value.trim(),
            price: Number(this.price.value) || 0,
            category: this.category.value.trim(),
        };
    }
    fill(product) {
        this.title.value = product.title;
        this.price.value = String(product.price);
        this.category.value = product.category;
        this.total.textContent = String(product.price);
    }
    clear() {
        this.title.value = "";
        this.price.value = "";
        this.category.value = "";
        this.total.textContent = "0";
    }
}
class ProductApp {
    constructor() {
        this.api = new ProductAPI();
        this.dom = new DomInputs();
        this.tbody = document.querySelector("tbody");
        this.submitBtn = document.getElementById("submit");
        this.searchInput = document.getElementById("search");
        this.editingId = null;
        this.submitBtn.addEventListener("click", () => this.handleSubmit());
        this.tbody.addEventListener("click", (e) => this.handleTableClick(e));
        this.searchInput.addEventListener("input", () => this.render());
        this.render();
    }
    handleSubmit() {
        return __awaiter(this, void 0, void 0, function* () {
            const product = this.dom.read();
            if (!product.title || !product.category)
                return;
            try {
                if (this.editingId !== null) {
                    yield this.api.update(this.editingId, Object.assign(Object.assign({}, product), { id: this.editingId }));
                    this.editingId = null;
                    this.submitBtn.textContent = "Add / Update";
                }
                else {
                    yield this.api.create(product);
                }
                this.dom.clear();
                this.render();
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    handleTableClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = e.target;
            const id = target.dataset.id;
            if (!id)
                return;
            try {
                if (target.classList.contains("delete")) {
                    yield this.api.delete(id);
                    this.render();
                }
                if (target.classList.contains("update")) {
                    const products = yield this.api.getAll();
                    const product = products.find((p) => p.id === id);
                    if (!product)
                        return;
                    this.editingId = id;
                    this.dom.fill(product);
                    this.submitBtn.textContent = "Update";
                }
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield this.api.getAll();
                const query = this.searchInput.value.toLowerCase();
                const filtered = products.filter((p) => p.title.toLowerCase().includes(query));
                this.tbody.innerHTML = "";
                filtered.forEach((p, index) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${p.title}</td>
          <td>${p.price}</td>
          <td>${p.category}</td>
          <td><button class="delete" data-id="${p.id}">Delete</button></td>
        `;
                    this.tbody.appendChild(tr);
                });
            }
            catch (err) {
                console.error(err);
            }
        });
    }
}
new ProductApp();
export {};
//# sourceMappingURL=index.js.map