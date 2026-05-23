import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'matriculaValida', async: false })
export class MatriculaValidaConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false;

    // todos os números iguais
    if (/^(\d)\1+$/.test(value)) {
      return false;
    }

    // padrão repetitivo de 2 dígitos
    if (/^(\d{2})\1+$/.test(value)) {
      return false;
    }

    // sequências numéricas crescentes ou decrescentes (ex: 12345678, 87654321)
    let isAscending = true;
    let isDescending = true;

    for (let i = 1; i < value.length; i++) {
      const prev = parseInt(value[i - 1], 10);
      const curr = parseInt(value[i], 10);

      if (curr !== prev + 1) isAscending = false;
      if (curr !== prev - 1) isDescending = false;
    }

    if (isAscending || isDescending) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'A matrícula possui um padrão inválido.';
  }
}

// Decorator customizado para facilitar o uso nos DTOs
export function IsMatriculaValida(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MatriculaValidaConstraint,
    });
  };
}
