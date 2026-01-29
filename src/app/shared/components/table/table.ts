import { Component, Input, ViewChild, AfterViewInit, OnChanges, OnInit, SimpleChanges, TemplateRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, FormControl, debounceTime, distinctUntilChanged } from '../../../shared/app-material/material.exports';
import { AppMaterialModule } from '../../../shared/app-material/app-material-module';
import { TableColumn } from './models/table-column.model';

@Component({
  selector: 'app-shared-table',
  standalone: true,
  imports: [CommonModule, AppMaterialModule, ReactiveFormsModule],
  templateUrl: './table.html',
  styleUrl: './table.scss'
})
export class SharedTableComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() data: any[] = [];

  // Novo formato: array de objetos TableColumn
  @Input() columnsConfig: TableColumn[] = [];

  // Formatos antigos (mantidos para compatibilidade)
  @Input() columns: string[] = [];
  @Input() labels: { [key: string]: string } = {};
  @Input() templates: { [key: string]: TemplateRef<any> } = {};
  @Input() tableTitle: string = "Lista";
  @Input() emptyMessage: string = 'Nenhum registro encontrado.';
  @Input() canAdd: boolean = true;

  // Configurações opcionais
  @Input() enablePagination = true;
  @Input() pageSizeOptions = [5, 10, 20];
  @Input() enableSearch = true;
  @Input() enableSelection = false;
  @Input() enableVirtualScroll = false;
  @Input() striped = true;
  @Input() mobileCardView = true;
  @Input() hideableColumns: string[] = [];


  // Configuração de Sort e Search (usados apenas se columnsConfig não está preenchido)
  @Input() sortableColumns: string[] = [];
  @Input() sortFieldMapping: { [key: string]: string } = {};
  @Input() searchableColumns: string[] = [];
  @Input() searchPlaceholder: string = 'Buscar...';

  @Output() add = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() search = new EventEmitter<string>();

  dataSource = new MatTableDataSource<any>([]);
  searchControl = new FormControl('');
  selectedRows = new Set<any>();
  displayedColumns: string[] = [];
  isMobile = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    // Se columnsConfig foi fornecido, processar e extrair configurações
    if (this.columnsConfig && this.columnsConfig.length > 0) {
      this.processColumnsConfig();
    }

    this.setupSearch();
    this.checkMobileView();
    this.updateDisplayedColumns();
  }

  private processColumnsConfig() {
    // Extrair columns
    this.columns = this.columnsConfig.map(col => col.columnName);

    // Extrair labels
    this.labels = {};
    this.columnsConfig.forEach(col => {
      this.labels[col.columnName] = col.columnLabel;
    });

    // Extrair sortableColumns (padrão true)
    this.sortableColumns = this.columnsConfig
      .filter(col => col.sortable !== false && col.columnName !== 'actions')
      .map(col => col.columnName);

    // Extrair searchableColumns (padrão true)
    this.searchableColumns = this.columnsConfig
      .filter(col => col.findable !== false && col.columnName !== 'actions')
      .map(col => col.columnName);

    // Extrair sortFieldMapping
    this.sortFieldMapping = {};
    this.columnsConfig.forEach(col => {
      if (col.sortField && col.sortField !== col.columnName) {
        this.sortFieldMapping[col.columnName] = col.sortField;
      }
    });

    // Extrair hideableColumns (colunas customizáveis)
    this.hideableColumns = this.columnsConfig
      .filter(col => col.columnName !== 'id' && col.columnName !== 'actions')
      .map(col => col.columnName);
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.filterData(value || '');
        this.search.emit(value || '');
      });
  }

  private filterData(query: string) {
    if (!query) {
      this.dataSource.data = this.data;
      return;
    }

    const columnsToSearch = this.searchableColumns.length > 0
      ? this.searchableColumns
      : this.columns;

    const filtered = this.data.filter(item =>
      columnsToSearch.some(col =>
        String(item[col] || '').toLowerCase().includes(query.toLowerCase())
      )
    );
    this.dataSource.data = filtered;
  }

  private checkMobileView() {
    this.isMobile = window.innerWidth <= 599;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 599;
      this.updateDisplayedColumns();
    });
  }

  private updateDisplayedColumns() {
    let cols = this.enableSelection ? ['select', ...this.columns] : [...this.columns];
    this.displayedColumns = cols;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
      this.selectedRows.clear();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Configurar comparadores customizados para colunas com templates
    if (this.dataSource.sort) {
      this.dataSource.sortingDataAccessor = (item: any, sortHeaderId: string) => {
        // Se a coluna está mapeada em sortFieldMapping, usar o campo mapeado
        if (this.sortFieldMapping[sortHeaderId]) {
          const mappedField = this.sortFieldMapping[sortHeaderId];
          const value = item[mappedField];
          return typeof value === 'string' ? value.toLowerCase() : value || '';
        }

        // Caso contrário, tentar acessar direto
        const value = item[sortHeaderId];

        if (typeof value === 'string') {
          return value.toLowerCase();
        }

        return value || '';
      };
    }
  }

  isSortable(column: string): boolean {
    // Se sortableColumns está vazia, todas as colunas são ordenáveis (exceto 'select' e 'actions')
    if (this.sortableColumns.length === 0) {
      return column !== 'select' && column !== 'actions';
    }

    // Caso contrário, verificar se a coluna está na lista
    return this.sortableColumns.includes(column);
  }

  toggleSelectAll(event: any) {
    if (event.checked) {
      this.dataSource.data.forEach(item => this.selectedRows.add(item));
    } else {
      this.selectedRows.clear();
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  toggleSelectRow(item: any, event: any) {
    if (event.checked) {
      this.selectedRows.add(item);
    } else {
      this.selectedRows.delete(item);
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  isRowSelected(item: any): boolean {
    return this.selectedRows.has(item);
  }

  isAllSelected(): boolean {
    return this.selectedRows.size === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  toggleColumn(column: string) {
    const index = this.displayedColumns.indexOf(column);
    if (index > -1) {
      this.displayedColumns.splice(index, 1);
    } else {
      this.displayedColumns.push(column);
    }
    this.displayedColumns = [...this.displayedColumns];
  }

  onAdd() {
    this.add.emit();
  }
}

