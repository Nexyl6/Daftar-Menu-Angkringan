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
// jika menggunakan physical device, silahkan menggunakan tethering
  // lalu cek ip address dari laptop/pc yang digunakan
  // untuk windows, gunakan perintah ipconfig
  // untuk linux, gunakan perintah ifconfig
  //private apiUrl = 'http://172.20.10.2/todo/api.php';
  // jika menggunakan emulator, silahkan menggunakan localhost
  private apiUrl = 'http://192.168.11.8/menu/api.php'; //pastikan url sesuai dengan komputer anda
// bisa saja menggunakan ip komputer dan dalam wifi yang sama
// atau anda bisa menggunakan free hosting
  constructor(private http: HttpClient) {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const dbOptions: capConnectionOptions = {
      database: 'db_daftarmenu',
      encrypted: false,
      mode: 'no-encryption',
      readonly: false
    };

    // Use this.db as a reference to CapacitorSQLite for executing queries
    this.db = CapacitorSQLite;
    this.db.createConnection(dbOptions);
    this.db.open({ database: 'db_daftarmenu', readonly: false });

    await this.createTable();
  }

  private async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_makanan TEXT NOT NULL,
        nama_minuman TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      )`;

    // Use CapacitorSQLite for running queries
    await this.db.run({ database: 'db_daftarmenu', statement: query, values: [] });
  }

  async addMenuItem(namaMakanan: string, namaMinuman: string): Promise<void> {
    const query = 'INSERT INTO menu (nama_makanan, nama_minuman) VALUES (?, ?)';
    await this.db.run({ database: 'db_daftarmenu', statement: query, values: [namaMakanan, namaMinuman] });
  }

  async getMenuItems(): Promise<any[]> {
    const query = 'SELECT * FROM menu';
    const result = await this.db.query({ database: 'db_daftarmenu', statement: query, values: [] });
    return result?.values || [];
  }

  async updateMenuItemStatus(id: number, completed: number): Promise<void> {
    const query = 'UPDATE menu SET completed = ? WHERE id = ?';
    await this.db.run({ database: 'db_daftarmenu', statement: query, values: [completed, id] });
  }

  async deleteMenuItem(id: number): Promise<void> {
    const query = 'DELETE FROM menu WHERE id = ?';
    await this.db.run({ database: 'db_daftarmenu', statement: query, values: [id] });
  }

  async clearMenuItems(): Promise<void> {
    const query = 'DELETE FROM menu';
    await this.db.run({ database: 'db_daftarmenu', statement: query, values: [] });
  }

  async addMenuItemAndSync(namaMakanan: string, namaMinuman: string): Promise<void> {
    await this.addMenuItem(namaMakanan, namaMinuman); // Add to local SQLite database
    await this.syncMenuItemsNative(); // Sync with the remote API using CapacitorHttp
  }

  private async syncMenuItemsNative(): Promise<void> {
    const menuItems = await this.getMenuItems(); // Get all local menu items
  
    // Send each menu item to the API using CapacitorHttp
    for (const menuItem of menuItems) {
      const payload = { "nama_makanan": menuItem.nama_makanan, "nama_minuman": menuItem.nama_minuman };
      const options = {
        url: this.apiUrl,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      };
  
      console.log('Syncing menu item value:', JSON.stringify(payload));
      const response = await CapacitorHttp.request({ ...options, method: 'POST' });
      console.log('Menu item synced successfully');
      console.log('Response', response);
    }
  }
}