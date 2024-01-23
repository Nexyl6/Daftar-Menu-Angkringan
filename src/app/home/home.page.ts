import { SQLiteService } from './../services/sqlite.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  newMenuItem: any = { nama_makanan: '', nama_minuman: ''};
  menuItems: any[] = [];

  constructor(private sqliteService: SQLiteService) {
    this.loadMenu();
  }

  async loadMenu(): Promise<void> {
    this.menuItems = await this.sqliteService.getMenus();
  }


  addMenu(): void {
    if (this.newMenuItem.nama_makanan && this.newMenuItem.nama_minuman) {
      this.saveMenuAndSync(this.newMenuItem.nama_makanan, this.newMenuItem.nama_minuman);
      this.newMenuItem.nama_makanan = '';
      this.newMenuItem.nama_minuman = '';
    }
  }

  updateMenuStatus(id: number, berhasil: number): void {
    this.sqliteService.updateMenuStatus(id, berhasil)
      .then(() => this.loadMenu())
      .catch(error => console.error('gagal memperbarui status menu', error));
  }

  deleteMenu(id: number): void {
    this.sqliteService.deleteMenu(id)
      .then(() => this.loadMenu())
      .catch(error => console.error('gagal menghapus menu', error));
  }

  clearMenu(): void {
    this.sqliteService.clearMenus()
      .then(() => this.loadMenu())
      .catch(error => console.error('gagal menghapus menu', error));
  }

  saveMenuAndSync(namaMakanan: string, namaMinuman: string): void {
    this.sqliteService.addMenuAndSync(namaMakanan, namaMinuman)
      .then(() => {
        console.log('Menu berhasil ditambahkan');
        this.loadMenu(); 
      })
      .catch(error => console.error('Menu gagal ditambahkan', error));
  }
}
