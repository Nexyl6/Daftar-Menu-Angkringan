import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CapacitorSQLite, capConnectionOptions } from '@capacitor-community/sqlite';
import { CapacitorHttp } from '@capacitor/core';
​

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {

  db = CapacitorSQLite;

  private apiUrl = 'http://192.168.1.2/menu/api.php'; 


  constructor(private http: HttpClient) {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const dbOptions: capConnectionOptions = {
      database: 'my-database',
      encrypted: false,
      mode: 'no-encryption',
      readonly: false
    };

    this.db = CapacitorSQLite;
    this.db.createConnection(dbOptions);
    this.db.open({ database: "my-database", readonly: false });

    await this.createTable();
  }

  private async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_makanan TEXT NOT NULL,
        nama_minuman TEXT NOT NULL,
        berhasil INTEGER DEFAULT 0
      )`;

    await this.db.run({ database: "my-database", statement: query, values: [] });
  }

  async addMenu(namaMakanan: string, namaMinuman: string): Promise<void> {
    const query = 'INSERT INTO menu (nama_makanan, nama_minuman) VALUES (?, ?)';
    await this.db.run({ database: "my-database", statement: query, values: [namaMakanan, namaMinuman] });
  }

  async getMenus(): Promise<any[]> {
    const query = 'SELECT * FROM menu';
    const result = await this.db.query({ database: "my-database", statement: query, values: [] });
    return result?.values || [];
  }

  async updateMenuStatus(id: number, berhasil: number): Promise<void> {
    const query = 'UPDATE menu SET completed = ? WHERE id = ?';
    await this.db.run({ database: "my-database", statement: query, values: [berhasil, id] });
  }

  async deleteMenu(id: number): Promise<void> {
    const query = 'DELETE FROM menu WHERE id = ?';
    await this.db.run({ database: "my-database", statement: query, values: [id] });
  }

  async clearMenus(): Promise<void> {
    const query = 'DELETE FROM menu';
    await this.db.run({ database: "my-database", statement: query, values: [] });
  }
  
  async addMenuAndSync(namaMakanan: string, namaMinuman: string): Promise<void> {
    await this.addMenu(namaMakanan, namaMinuman); // Add to local SQLite database
    await this.syncMenusNative(namaMakanan, namaMinuman); // Sync with the remote API
}

private async syncMenusNative(namaMakanan: string, namaMinuman: string): Promise<void> {
    const options = {
        url: this.apiUrl,
        headers: { 'Content-Type': 'application/json' },
    };

    const payload = { "nama_makanan": namaMakanan, "nama_minuman": namaMinuman }; 
    const sendValue = {
        ...options,
        data: payload,
    };

    console.log('Syncing menu value:', JSON.stringify(payload));
    const response = await CapacitorHttp.request({ ...sendValue, method: 'POST' });

    console.log('Menu berhasil di sinkronisasi');
    console.log('response', response);
  }
}
