import { UrlTree } from "@angular/router";

export interface News {
  title: string;
  date: Date;
  summary: string;
  link: string|readonly any[]|UrlTree;
}
