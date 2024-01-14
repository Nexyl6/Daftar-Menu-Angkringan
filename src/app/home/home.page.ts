import { SQLiteService } from './../services/sqlite.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  menuItems: any[] = [];
  newMenuItem = { nama_makanan: '', nama_minuman: '' };

  constructor(private sqliteService: SQLiteService) {
    this.loadMenuItems();
  }

  async loadMenuItems(): Promise<void> {
    this.menuItems = await this.sqliteService.getMenuItems();
  }

  addMenuItem(): void {
    const { nama_makanan, nama_minuman } = this.newMenuItem;
    if (nama_makanan && nama_minuman) {
      this.sqliteService.addMenuItem(nama_makanan, nama_minuman)
        .then(() => {
          this.loadMenuItems();
          this.newMenuItem = { nama_makanan: '', nama_minuman: '' }; // Clear input fields after adding
        })
        .catch(error => console.error('Error adding menu item', error));
    }
  }

  updateMenuItemStatus(id: number, completed: number): void {
    this.sqliteService.updateMenuItemStatus(id, completed)
      .then(() => this.loadMenuItems())
      .catch(error => console.error('Error updating menu item status', error));
  }

  deleteMenuItem(id: number): void {
    this.sqliteService.deleteMenuItem(id)
      .then(() => this.loadMenuItems())
      .catch(error => console.error('Error deleting menu item', error));
  }

  clearMenuItems(): void {
    this.sqliteService.clearMenuItems()
      .then(() => this.loadMenuItems())
      .catch(error => console.error('Error clearing menu items', error));
  }

  saveMenuItemAndSync(namaMakanan: string, namaMinuman: string): void {
    this.sqliteService.addMenuItemAndSync(namaMakanan, namaMinuman)
      .then(() => console.log('Menu item added and synced successfully'))
      .catch(error => console.error('Error adding and syncing menu item', error));
  }
}