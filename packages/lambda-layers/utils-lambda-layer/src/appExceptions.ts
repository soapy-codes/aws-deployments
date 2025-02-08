export class MissingEnvironmentVariable extends Error {
  constructor(variableName: string) {
    super(`environment variable not passed: ${variableName}`);
  }
}

export class MissingRequestBody extends Error {
  constructor() {
    super(`the body is missing`);
  }
}

export class MissingProperty extends Error {
  constructor(propertyName: string) {
    super(`parameter is missing: ${propertyName}`);
  }
}
