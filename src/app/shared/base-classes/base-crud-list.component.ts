import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, catchError, delay, of, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DialogsService } from '../services/dialogs.service';
import { IFormDialogData } from '../components/dialogs/form/IFormDialogData';
import { IDetailsDialogData } from '../components/dialogs/details/IDetailsDialogData';
import { IDeleteConfirmData } from '../components/dialogs/delete-confirm/IDeleteConfirmData';
import { ICrudEntity } from '../interfaces/icrud-entity';
import { ICrudListConfig } from '../interfaces/icrud-config';
import { BaseCrudService } from './base-crud.service';

/**
 * Componente base genérico para listar e gerenciar qualquer entidade CRUD
 *
 * Fornece funcionalidade completa para:
 * - Listar entidades em tabela
 * - Criar nova entidade (formulário em diálogo)
 * - Editar entidade existente (formulário em diálogo)
 * - Visualizar detalhes (modal read-only)
 * - Deletar entidade (confirmação)
 * - Tratamento de erros e feedback do usuário
 *
 * @template T - Tipo da entidade que estende ICrudEntity
 *
 * @example
 * @Component({
 *   selector: 'app-musicians',
 *   standalone: true,
 *   imports: [CommonModule, AppMaterialModule, SharedTableComponent, MatSnackBarModule],
 *   templateUrl: './musicians.html',
 *   styleUrl: './musicians.scss',
 * })
 * export class MusicianComponent extends BaseCrudListComponent<Musician> {
 *   readonly config: ICrudListConfig<Musician> = {
 *     title: 'Músicos',
 *     endpoint: 'musicians.json',
 *     entityName: 'Músico',
 *     columns: MUSICIAN_COLUMNS,
 *     formFields: MUSICIAN_FORM_FIELDS,
 *     detailFields: getMusicianDetailFields
 *   };
 *
 *   constructor(
 *     public readonly service: MusicianService,
 *     dialogsService: DialogsService,
 *     snackBar: MatSnackBar
 *   ) {
 *     super(dialogsService, snackBar);
 *   }
 * }
 */
@Component({
  template: '' // Abstract component, template vai em subclass
})
export abstract class BaseCrudListComponent<T extends ICrudEntity> implements OnInit {
  /**
   * Observable que fornece a lista de entidades
   * Reativamente atualizado quando dados são criados/editados/deletados
   */
  data$: Observable<T[]>;

  /**
   * Flag para indicar se houve erro ao carregar dados
   */
  hasError = false;

  /**
   * Trigger para recarregar dados
   * Toda ação CRUD dispara um próximo() para recarregar lista
   */
  protected readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

  /**
   * Configuração da entidade (title, columns, formFields, etc)
   * Deve ser implementado nas subclasses
   */
  abstract readonly config: ICrudListConfig<T>;

  /**
   * Serviço CRUD da entidade
   * Deve ser injetado nas subclasses
   */
  abstract readonly service: BaseCrudService<T>;

  constructor(
    protected readonly dialogsService: DialogsService,
    protected readonly snackBar: MatSnackBar
  ) {
    this.data$ = this.setupDataObservable();
  }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Abre diálogo de formulário para criar nova entidade
   *
   * @public - Chamado pelo template
   */
  onAdd(): void {
    const formConfig: IFormDialogData = {
      title: `Novo ${this.config.entityName}`,
      submitText: 'Criar',
      fields: this.config.formFields()
    };

    this.dialogsService.openForm(formConfig).afterClosed().subscribe(result => {
      if (result) {
        this.handleCreate(result);
      }
    });
  }

  /**
   * Abre diálogo de formulário para editar entidade existente
   *
   * @param entity - Entidade a editar
   * @public - Chamado pelo template
   */
  onEdit(entity: T): void {
    const formConfig: IFormDialogData = {
      title: `Editar ${this.config.entityName}`,
      submitText: 'Salvar',
      fields: this.config.formFields(entity)
    };

    this.dialogsService.openForm(formConfig).afterClosed().subscribe(result => {
      if (result) {
        this.handleUpdate(entity.id, result);
      }
    });
  }

  /**
   * Abre modal com detalhes da entidade (read-only)
   *
   * @param entity - Entidade a visualizar
   * @public - Chamado pelo template
   */
  onView(entity: T): void {
    const detailsConfig: IDetailsDialogData = {
      title: `Detalhes ${this.config.entityName}`,
      showEditButton: true,
      editButtonText: 'Editar',
      fields: this.config.detailFields(entity)
    };

    this.dialogsService.openDetails(detailsConfig).afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.onEdit(entity);
      }
    });
  }

  /**
   * Abre diálogo de confirmação para deletar entidade
   *
   * @param entity - Entidade a deletar
   * @public - Chamado pelo template
   */
  onDelete(entity: T): void {
    const deleteConfig: IDeleteConfirmData = {
      title: `Deletar ${this.config.entityName}`,
      message: `Tem certeza que deseja deletar este ${this.config.entityName.toLowerCase()}?`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar'
    };

    this.dialogsService.openDeleteConfirm(deleteConfig).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.handleDelete(entity.id);
      }
    });
  }

  /**
   * Configura o observable que fornece dados da entidade
   * Implementa pattern: switchMap + delay + catchError + async pipe
   *
   * @protected
   * @returns Observable que emite array de entidades
   */
  protected setupDataObservable(): Observable<T[]> {
    return this.refreshTrigger$.pipe(
      switchMap(() =>
        this.service.list().pipe(
          delay(1000), // Delay para mostrar loading
          catchError(error => {
            console.error(`Erro ao carregar ${this.config.entityName}:`, error);
            this.hasError = true;
            return of([]); // Fallback para array vazio
          })
        )
      )
    );
  }

  /**
   * Carrega dados da entidade
   *
   * @protected
   */
  protected loadData(): void {
    this.refreshTrigger$.next();
  }

  /**
   * Recarrega dados da entidade
   * Chamado após criar/atualizar/deletar
   *
   * @protected
   */
  protected refreshData(): void {
    this.refreshTrigger$.next();
  }

  /**
   * Trata criação de nova entidade
   *
   * @protected
   * @param formData - Dados do formulário
   */
  protected handleCreate(formData: any): void {
    this.service.create(formData).subscribe({
      next: () => {
        this.showSuccessMessage(`${this.config.entityName} criado com sucesso!`);
        this.refreshData();
      },
      error: (error: unknown) => {
        console.error(`Erro ao criar ${this.config.entityName}:`, error);
        this.showErrorMessage(`Erro ao criar ${this.config.entityName}!`);
      }
    });
  }

  /**
   * Trata atualização de entidade
   *
   * @protected
   * @param id - ID da entidade
   * @param formData - Dados do formulário
   */
  protected handleUpdate(id: number, formData: any): void {
    this.service.update(id, formData).subscribe({
      next: () => {
        this.showSuccessMessage(`${this.config.entityName} atualizado com sucesso!`);
        this.refreshData();
      },
      error: (error: unknown) => {
        console.error(`Erro ao atualizar ${this.config.entityName}:`, error);
        this.showErrorMessage(`Erro ao atualizar ${this.config.entityName}!`);
      }
    });
  }

  /**
   * Trata exclusão de entidade
   *
   * @protected
   * @param id - ID da entidade
   */
  protected handleDelete(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.showSuccessMessage(`${this.config.entityName} deletado com sucesso!`);
        this.refreshData();
      },
      error: (error: unknown) => {
        console.error(`Erro ao deletar ${this.config.entityName}:`, error);
        this.showErrorMessage(`Erro ao deletar ${this.config.entityName}!`);
      }
    });
  }

  /**
   * Exibe mensagem de sucesso via snackbar
   *
   * @protected
   * @param message - Mensagem a exibir
   */
  protected showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000 });
  }

  /**
   * Exibe mensagem de erro via snackbar
   *
   * @protected
   * @param message - Mensagem a exibir
   */
  protected showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
