

export class ValidatorsUtils {

  static requiredObjectFields(values: string[], length: number) {
    if (values.length !== length) {
      throw new Error('El número de elementos a evaluar debe ser igual el número esperado: "length"');
    }

    const result = values.filter(Boolean);

    return (result.length === length);
  }

}

