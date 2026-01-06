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
        this.baseUrl = "https://zzgiqrjbpbxmdtqjiqft.supabase.co/rest/v1/products";
        this.headers = {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z2lxcmpicGJ4bWR0cWppcWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTA2NzgsImV4cCI6MjA4MzI4NjY3OH0.qk4rMBF1gdMZJx_pkYY6sBKFlnUoelqeANbADAKAphM",
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Z2lxcmpicGJ4bWR0cWppcWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTA2NzgsImV4cCI6MjA4MzI4NjY3OH0.qk4rMBF1gdMZJx_pkYY6sBKFlnUoelqeANbADAKAphM",
            "Content-Type": "application/json",
            Prefer: "return=representation"
        };
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${this.baseUrl}?select=*`, { headers: this.headers });
            if (!res.ok)
                throw new Error("Failed to fetch products");
            const data = yield res.json();
            return data;
        });
    }
    create(product) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { title: product.title, price: product.price, category: product.category };
            const res = yield fetch(this.baseUrl, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const error = yield res.json();
                throw new Error(error.message || "Failed to create product");
            }
            const data = yield res.json();
            if (!data || !data[0])
                throw new Error("No product returned after creation");
            return data[0];
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${this.baseUrl}?id=eq.${id}`, {
                method: "DELETE",
                headers: this.headers
            });
            if (!res.ok)
                throw new Error("Failed to delete product");
        });
    }
}
class DomInputs {
    constructor() {
        const titleInput = document.getElementById("title");
        const priceInput = document.getElementById("price");
        const categoryInput = document.getElementById("category");
        if (!(titleInput instanceof HTMLInputElement))
            throw new Error("Missing title input");
        if (!(priceInput instanceof HTMLInputElement))
            throw new Error("Missing price input");
        if (!(categoryInput instanceof HTMLInputElement))
            throw new Error("Missing category input");
        this.title = titleInput;
        this.price = priceInput;
        this.category = categoryInput;
    }
    read() {
        return {
            title: this.title.value.trim(),
            price: Number(this.price.value) || 0,
            category: this.category.value.trim()
        };
    }
    clear() {
        this.title.value = "";
        this.price.value = "";
        this.category.value = "";
    }
}
class ProductApp {
    constructor() {
        this.api = new ProductAPI();
        this.dom = new DomInputs();
        const tbodyEl = document.querySelector("tbody");
        const submitBtnEl = document.getElementById("submit");
        const searchInputEl = document.getElementById("search");
        if (!(tbodyEl instanceof HTMLTableSectionElement))
            throw new Error("Missing tbody element");
        if (!(submitBtnEl instanceof HTMLButtonElement))
            throw new Error("Missing submit button");
        if (!(searchInputEl instanceof HTMLInputElement))
            throw new Error("Missing search input");
        this.tbody = tbodyEl;
        this.submitBtn = submitBtnEl;
        this.searchInput = searchInputEl;
        this.submitBtn.addEventListener("click", () => this.handleAdd());
        this.tbody.addEventListener("click", (e) => this.handleDeleteClick(e));
        this.searchInput.addEventListener("input", () => this.render());
        this.render();
    }
    handleAdd() {
        return __awaiter(this, void 0, void 0, function* () {
            const product = this.dom.read();
            if (!product.title || !product.category)
                return;
            try {
                yield this.api.create(product);
                this.dom.clear();
                yield this.render();
            }
            catch (err) {
                console.error(err);
                alert("Error adding product: " + (err instanceof Error ? err.message : String(err)));
            }
        });
    }
    handleDeleteClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = e.target;
            if (!(target instanceof HTMLButtonElement))
                return;
            if (!target.classList.contains("delete"))
                return;
            const idStr = target.dataset.id;
            if (!idStr)
                return;
            const id = Number(idStr);
            try {
                yield this.api.delete(id);
                yield this.render();
            }
            catch (err) {
                console.error(err);
                alert("Error deleting product: " + (err instanceof Error ? err.message : String(err)));
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
                this.tbody.innerHTML = `<tr><td colspan="5">Failed to load products</td></tr>`;
            }
        });
    }
}
new ProductApp();
export {};
//# sourceMappingURL=index.js.map