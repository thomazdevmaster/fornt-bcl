/**
 * Importa tipos do arquivo de interfaces de formulário
 * Para evitar referência circular, importamos do arquivo original
 */
import { IFormFieldConfig } from '../components/dialogs/form/IFormDialogData';
import { IDetailField } from '../components/dialogs/details/IDetailsDialogData';
import { TableColumn } from '../components/table/models/table-column.model';
import { ICrudEntity } from './icrud-entity';

/**
 * Configuração genérica para componentes de listagem CRUD
 * Define todo o setup necessário para listar e gerenciar uma entidade
 *
 * @template T - Tipo da entidade que estende ICrudEntity
 *
 * @example
 * const config: ICrudListConfig<Musician> = {
 *   title: 'Gerenciamento de Músicos',
 *   endpoint: 'musicians.json',
 *   entityName: 'Músico',
 *   columns: MUSICIAN_COLUMNS,
 *   formFields: MUSICIAN_FORM_FIELDS,
 *   detailFields: getMusicianDetailFields
 * };
 */
export interface ICrudListConfig<T extends ICrudEntity> {
  /**
   * Título da página (ex: "Gerenciamento de Músicos")
   */
  title: string;

  /**
   * URL/endpoint do API (ex: "musicians.json")
   * Usado pelo BaseCrudService para fazer requisições
   */
  endpoint: string;

  /**
   * Nome singular da entidade (ex: "Músico")
   * Usado em mensagens e diálogos
   */
  entityName: string;

  /**
   * Colunas da tabela
   * Define qual campo exibir, label, sortable, etc.
   */
  columns: TableColumn[];

  /**
   * Função que retorna configuração dos campos do formulário
   * Pode receber a entidade para modo edit (pré-preenchimento)
   *
   * @param entity - Entidade para modo edit (opcional)
   * @returns Array com configuração dos campos
   */
  formFields: (entity?: T) => IFormFieldConfig[];

  /**
   * Função que retorna configuração dos campos de detalhes
   * Usado para exibir detalhes em read-only
   *
   * @param entity - Entidade a exibir
   * @returns Array com configuração dos campos
   */
  detailFields: (entity: T) => IDetailField[];
}
