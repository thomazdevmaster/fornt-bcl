import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class MyDateValidators {
  static pastDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Se a data inserida for maior ou igual a hoje, retorna erro
      return inputDate >= today ? { futureDate: true } : null;
    };
  }
}