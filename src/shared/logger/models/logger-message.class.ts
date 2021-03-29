import { EComponents } from "@shared/enum/components.enum";
import { IsDate, IsEnum, IsObject, IsString, MinLength } from "class-validator";


export class LoggerMessage {
  @IsString()
  @MinLength(5, { message: 'Message must have a minimum of characters' })
  message: string;

  @IsEnum({ entity: EComponents })
  component: string;

  @IsDate()
  time: Date;

  @IsObject()
  data: object;

  constructor(message: string, component: string, data = {}) {
    this.message = message;
    this.component = component;
    this.time = new Date();
    this.data = data;
  }
}