import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Guard para proteger rotas que requerem autenticação
 * Você pode implementar lógica de autenticação conforme necessário
 *
 * @example
 * const routes: Routes = [
 *   {
 *     path: 'protected',
 *     component: ProtectedComponent,
 *     canActivate: [AuthGuard]
 *   }
 * ];
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Implemente sua lógica de autenticação aqui
    // Por exemplo: verificar se existe token de autenticação

    const isAuthenticated = this.checkAuthentication();

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

  /**
   * Verifica se o usuário está autenticado
   * Implemente conforme sua estratégia de autenticação
   */
  private checkAuthentication(): boolean {
    // Exemplo simples com localStorage
    const token = localStorage.getItem('auth_token');
    return !!token;
  }
}
