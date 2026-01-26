import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormDialogComponent } from '../components/dialogs/form/form';
import { DetailsDialogComponent } from '../components/dialogs/details/details';
import { DeleteConfirmComponent } from '../components/dialogs/delete-confirm/delete-confirm';
import { IFormDialogData } from '../components/dialogs/form/IFormDialogData';
import { IDetailsDialogData } from '../components/dialogs/details/IDetailsDialogData';
import { IDeleteConfirmData } from '../components/dialogs/delete-confirm/IDeleteConfirmData';

@Injectable({
  providedIn: 'root'
})
export class DialogsService {
  constructor(private dialog: MatDialog) {}

  /**
   * Abre diálogo de formulário (create/edit)
   * @param data - Configuração do formulário
   * @returns DialogRef
   */
  openForm(data: IFormDialogData, width: string = '500px'): MatDialogRef<FormDialogComponent> {
    return this.dialog.open(FormDialogComponent, {
      width,
      data,
      disableClose: false
    });
  }

  /**
   * Abre diálogo de detalhes (read-only)
   * @param data - Configuração dos campos e valores
   * @returns DialogRef
   */
  openDetails(data: IDetailsDialogData, width: string = '500px'): MatDialogRef<DetailsDialogComponent> {
    return this.dialog.open(DetailsDialogComponent, {
      width,
      data,
      disableClose: false
    });
  }

  /**
   * Abre diálogo de confirmação de exclusão
   * @param data - Configuração da confirmação
   * @returns DialogRef
   */
  openDeleteConfirm(data: IDeleteConfirmData, width: string = '400px'): MatDialogRef<DeleteConfirmComponent> {
    return this.dialog.open(DeleteConfirmComponent, {
      width,
      data,
      disableClose: false
    });
  }
}
