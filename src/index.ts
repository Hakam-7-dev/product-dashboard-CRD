// ================== TYPES ==================
interface Product {
  id: string;           // string IDs everywhere
  title: string;
  price: number;
  category: string;
}

// ================== API LAYER ==================
class ProductAPI {
  private readonly baseUrl = "http://localhost:3000/products";

  async getAll(): Promise<Product[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  }

  async create(product: Product): Promise<Product> {
    // Ensure string ID
    if (!product.id) {
      product.id = Math.random().toString(36).substr(2, 9);
    }
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  }

  async update(id: string, product: Product): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete product");
  }
}

// ================== DOM INPUTS ==================
class DomInputs {
  title = document.getElementById("title") as HTMLInputElement;
  price = document.getElementById("price") as HTMLInputElement;
  category = document.getElementById("category") as HTMLInputElement;
  total = document.getElementById("total") as HTMLParagraphElement;

  read(): Product {
    return {
      id: "", // will be generated in API if empty
      title: this.title.value.trim(),
      price: Number(this.price.value) || 0,
      category: this.category.value.trim(),
    };
  }

  fill(product: Product): void {
    this.title.value = product.title;
    this.price.value = String(product.price);
    this.category.value = product.category;
    this.total.textContent = String(product.price);
  }

  clear(): void {
    this.title.value = "";
    this.price.value = "";
    this.category.value = "";
    this.total.textContent = "0";
  }
}

// ================== APP CONTROLLER ==================
class ProductApp {
  private api = new ProductAPI();
  private dom = new DomInputs();

  private tbody = document.querySelector("tbody") as HTMLTableSectionElement;
  private submitBtn = document.getElementById("submit") as HTMLButtonElement;
  private searchInput = document.getElementById("search") as HTMLInputElement;

  private editingId: string | null = null;

  constructor() {
    this.submitBtn.addEventListener("click", () => this.handleSubmit());
    this.tbody.addEventListener("click", (e) => this.handleTableClick(e));
    this.searchInput.addEventListener("input", () => this.render());

    this.render();
  }

  // ---------- CREATE / UPDATE ----------
  private async handleSubmit(): Promise<void> {
    const product = this.dom.read();
    if (!product.title || !product.category) return;

    try {
      if (this.editingId !== null) {
        this.submitBtn.textContent = "Add";
      } else {
        await this.api.create(product);
      }
      this.dom.clear();
      this.render();
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- DELETE / EDIT ----------
  private async handleTableClick(e: Event): Promise<void> {
    const target = e.target as HTMLElement;
    const id = target.dataset.id;
    if (!id) return;

    try {
      if (target.classList.contains("delete")) {
        await this.api.delete(id);
        this.render();
      }

    } catch (err) {
      console.error(err);
    }
  }

  // ---------- RENDER ----------
  private async render(): Promise<void> {
    try {
      const products = await this.api.getAll();
      const query = this.searchInput.value.toLowerCase();

      const filtered = products.filter((p) =>
        p.title.toLowerCase().includes(query)
      );

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
    } catch (err) {
      console.error(err);
    }
  }
}

// ================== BOOTSTRAP ==================
new ProductApp();