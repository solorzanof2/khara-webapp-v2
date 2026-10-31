import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app.routing.module';
import { /* HTTP_INTERCEPTORS, */ provideHttpClient } from '@angular/common/http';
// import Aura from '@primeng/themes/aura';
// import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IdentityService } from './commons/services/identity.service';
import { StorageService } from './commons/services/storage.service';
import { RestService } from './commons/services/rest.service';
import { NotificationService } from './commons/services/notification.service';
// import { InterceptorService } from './commons/services/interceptor.service';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
  ],
  providers: [
    provideHttpClient(),
    provideAnimationsAsync(),
    // providePrimeNG({
    //   theme: {
    //     preset: Aura
    //   }
    // }),
    IdentityService,
    StorageService,
    RestService,
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: InterceptorService,
    //   multi: true,
    // },
    {
      provide: LOCALE_ID,
      useValue: 'es-AR',
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: '$',
    },
    NotificationService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

