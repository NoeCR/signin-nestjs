export class CustomError {
  component: string;
  method: string;
  message: string;
  data: object;

  constructor(error?: CustomError, component?: string, method?: string, message?: string, data = {}) {
    this.component = error.component || component;
    this.method = error.method || method;
    this.message = error.message || message;
    this.data = error.data || data;
  }
}