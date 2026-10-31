import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Pipe({
  name: 'SanitizeHTML',
  standalone: false,
})
export class SanitizeHTMLPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}

@NgModule({
  declarations: [
    SanitizeHTMLPipe,
  ],
  imports: [],
  exports: [
    SanitizeHTMLPipe,
  ]
})
export class SanitizeHTMLModule { }

